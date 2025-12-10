class Application {
    constructor() {
    }
    async loadAllAndRun(body) {
        /*
        TODO: add init here
        deactivatedSites.init();
        loadLists.init();
         */
        return globalStorage.loadAllAndRun(body);
    }
}
const application = new Application();
