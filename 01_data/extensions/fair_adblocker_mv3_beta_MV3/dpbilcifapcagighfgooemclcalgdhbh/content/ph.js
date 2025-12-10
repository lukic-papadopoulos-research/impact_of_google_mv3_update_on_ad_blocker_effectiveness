// ==UserScript==
/**
 * Stands's Block Pornhub Ads is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Stands's Block Pornhub Ads is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Stands's Block Pornhub Ads.  If not, see <http://www.gnu.org/licenses/>.
 */
function runBlockPornhub() {
    const locales = {
        en: {
            logo: '&nbsp;fair adblock',
            alreadyExecuted: 'The shortcut has already been executed.',
            wrongDomain: 'This shortcut is supposed to be launched only on Pornhub.',
            success: 'Pornhub is now ad-free! Please note that you need to run this shortcut again if you reload the page.',
        },
        ru: {
            logo: '&nbsp;fair adblock',
            alreadyExecuted: 'Быстрая команда уже выполнена.',
            wrongDomain: 'Эта быстрая команда предназначена для использования только на Pornhub.',
            success: 'Теперь Pornhub без рекламы! Важно: при перезагрузке страницы вам нужно будет заново запустить команду.',
        },
        es: {
            logo: '&nbsp;fair adblockrd',
            alreadyExecuted: 'El atajo ya ha sido ejecutado.',
            wrongDomain: 'Se supone que este atajo se lanza sólo en Pornhub.',
            success: '¡Pornhub está ahora libre de anuncios! Ten en cuenta que tienes que volver a ejecutar este atajo si recargas la página.',
        },
        de: {
            logo: '&nbsp;fair adblock',
            alreadyExecuted: 'Der Kurzbefehl wurde bereits ausgeführt.',
            wrongDomain: 'Dieser Kurzbefehl soll nur auf Pornhub gestartet werden.',
            success: 'Pornhub ist jetzt werbefrei! Bitte beachten Sie, dass Sie diesen Kurzbefehl erneut ausführen müssen, wenn Sie die Seite neu laden.',
        },
        fr: {
            logo: '&nbsp;fair adblock',
            alreadyExecuted: 'Le raccourci a déjà été exécuté.',
            wrongDomain: 'Ce raccourci est censé d’être lancé uniquement sur Pornhub.',
            success: 'Pornhub est maintenant libre de pub ! Veuillez noter qu’il faudra rééxecuter le raccourci si vous rechargez la page.',
        },
        it: {
            logo: '&nbsp;fair adblock',
            alreadyExecuted: 'Il comando è già stato eseguito.',
            wrongDomain: 'Questa scorciatoia dovrebbe essere lanciata solo su Pornhub.',
            success: 'Pornhub è ora libero da pubblicità! Si prega di notare che è necessario eseguire nuovamente questa scorciatoia se ricarichi la pagina.',
        },
        'zh-cn': {
            logo: '&nbsp;fair adblock',
            alreadyExecuted: '快捷指令已在运行',
            wrongDomain: '快捷指令只能在 Pornhub 上被启动。',
            success: '现在您的 Pornhub 没有广告！请注意，若您重新加载页面，您需要再次启动快捷指令。',
        },
        'zh-tw': {
            logo: '&nbsp;fair adblock',
            alreadyExecuted: '此捷徑已被執行。',
            wrongDomain: '此捷徑應該只於 Pornhub 上被啟動。',
            success: '現在 Pornhub 為無廣告的！請注意，若您重新載入該頁面，您需要再次執行此捷徑。',
        },
        ko: {
            logo: '&nbsp;fair adblock',
            alreadyExecuted: '단축어가 이미 실행되었습니다.',
            wrongDomain: '이 단축어는 Pornhub에서만 사용 가능합니다.',
            success: '이제 광고없이 Pornhub를 시청할 수 있습니다. 페이지를 새로고침 할 경우, 이 단축어를 다시 실행해야 합니다.',
        },
        ja: {
            logo: '&nbsp;fair adblock',
            alreadyExecuted: 'ショートカットは既に実行されています。',
            wrongDomain: '※このショートカットは、Pornhubでのみ適用されることを想定しています。',
            success: 'Pornhubが広告なしになりました！※Pornhubページを再読み込みした場合は、このショートカットを再度実行する必要がありますのでご注意ください。',
        },
        uk: {
            logo: '&nbsp;fair adblock',
            alreadyExecuted: 'Ця швидка команда вже виконується.',
            wrongDomain: 'Цю швидку команду слід запускати лише на Pornhub.',
            success: 'Тепер Pornhub без реклами! Проте після перезавантаження сторінки необхідно знову запустити цю швидку команду.',
        },
    };
    const getMessage = (key) => {
        try {
            let locale = locales[navigator.language.toLowerCase()];
            if (!locale) {
                const lang = navigator.language.split('-')[0];
                locale = locales[lang];
            }
            if (!locale) {
                locale = locales.en;
            }
            return locale[key];
        }
        catch (ex) {
            return locales.en[key];
        }
    };
    if (pageData) {
        injectScript("content/sites/pornhubPageScript.js", true);
    }
    return {
        success: true,
        status: 'success',
        message: getMessage('success'),
    };
}
(() => {
    if (pageData) {
        let finish = (m) => {
            console.log(m);
        };
        // @ts-ignore
        if (typeof completion !== 'undefined') {
            // @ts-ignore
            finish = completion;
        }
        try {
            const result = runBlockPornhub();
            finish(result.message);
        }
        catch (ex) {
            finish(ex.toString());
        }
    }
})();
