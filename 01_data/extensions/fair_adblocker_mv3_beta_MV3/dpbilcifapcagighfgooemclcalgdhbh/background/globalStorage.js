class GlobalVariableProxy {
    constructor(name, defaultValue) {
        this.name = name;
        this.defaultValue = defaultValue;
        globalStorage.addVariable(name, defaultValue);
    }
    async init() {
        await globalStorage.load([this.name]);
    }
    ;
    async store() {
        await globalStorage.store([this.name]);
    }
    ;
    async runWithData(codeBlock) {
        await this.init();
        codeBlock(this.getData());
        await this.store();
    }
    getData() {
        return globalStorage.getVal(this.name);
    }
    setData(value) {
        globalStorage.setVal(this.name, value);
        globalStorage.store([this.name]);
    }
    async getDataAsync() {
        await this.init();
        return globalStorage.getVal(this.name);
    }
}
function copyObjectProperties(dst, src) {
    Object.assign(dst, src);
}
const globalStorage = {
    data: {},
    variablesNames: [],
    variablesDescriptions: {},
    globalVariables: {},
    activeSessionsNumber: 0,
    async load(variables) {
        console.assert(Array.isArray(variables));
        const toLoad = variables.filter(v => !(v in this.data));
        const dataFromSession = await chrome.storage.local.get(toLoad);
        for (const v of toLoad) {
            if (v in dataFromSession) {
                const loadedData = dataFromSession[v];
                if (v in this.globalVariables) {
                    copyObjectProperties(this.globalVariables[v], loadedData);
                    this.data[v] = this.globalVariables[v];
                }
                else {
                    this.data[v] = loadedData;
                }
            }
            else {
                this.data[v] = this.variablesDescriptions[v].defaultValue;
            }
        }
    },
    async store(variables) {
        let tmp = {};
        for (const v of variables) {
            tmp[v] = this.data[v];
        }
        await chrome.storage.local.set(tmp);
    },
    async runWithContext(variables, codeBlock) {
        await this.load(variables);
        const context = {};
        for (const v of variables) {
            context[v] = this.data[v];
        }
        codeBlock(context);
        await this.store(variables);
    },
    getVal(key) {
        if (key in this.data) {
            return this.data[key];
        }
        else {
            debug.trace(`Variable ${key} is not loaded`);
            return undefined;
        }
    },
    setVal(key, value) {
        this.data[key] = value;
    },
    addVariable(name, defaultValue) {
        let varName = name;
        console.assert(!(varName in this.variablesDescriptions), "Variable already added");
        this.variablesNames.push(varName);
        this.variablesDescriptions[varName] = {
            name: name,
            defaultValue: defaultValue,
        };
    },
    createContainer(name, defaultValue) {
        return new GlobalVariableProxy(name, defaultValue);
    },
    async loadAllAndRun(body) {
        await this.load(this.variablesNames);
        try {
            this.activeSessionsNumber += 1;
            body();
        }
        finally {
            this.activeSessionsNumber -= 1;
            await this.store(this.variablesNames);
        }
    },
    bindGlobalVariable(variableName, variable) {
        console.assert(!(variableName in this.globalVariables), "Variable already added");
        this.globalVariables[variableName] = variable;
        this.addVariable(variableName, variable);
    },
    assertActive() {
        if (this.activeSessionsNumber === 0) {
            console.error("global storage not active");
            debug.trace();
        }
    }
};
