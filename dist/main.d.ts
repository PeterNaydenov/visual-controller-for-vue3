export type SetCallback = (markers: {
    start: Text;
    end: Text;
}, ...args: any) => string | void;
export type SetupUpdates = Object;
export type VisualControllerInstance = {
    set: SetCallback & ((fn: SetCallback, ...args: any[]) => void);
    publish: (alias: string, component: any, data?: object, extraParams?: object) => Promise<SetupUpdates | false>;
    destroy: (target?: string | string[]) => boolean | number;
    has: (alias: string) => boolean;
    getApp: (alias: string) => SetupUpdates | false;
    isEmpty: (alias: string) => boolean | undefined;
    list: () => string[];
    reset: () => void;
};
/**
 *  Callback that places dim markers into the DOM.
 *  @callback SetCallback
 *  @param {{ start: Text, end: Text }} markers - invisible text nodes; must be attached to the DOM
 *  @param {...*} args - extra args forwarded by `set`
 *  @returns {string | void} - return a string to register an alias
 */
/**
 *  Object passed to `setupUpdates` from inside a published component.
 *  @typedef {Object} SetupUpdates
 */
/**
 *  Controller instance returned by `VisualController`.
 *  @typedef {Object} VisualControllerInstance
 *  @property {SetCallback & ((fn: SetCallback, ...args: any[]) => void)} set
 *  @property {(alias: string, component: any, data?: object, extraParams?: object) => Promise<SetupUpdates | false>} publish
 *  @property {(target?: string | string[]) => boolean | number} destroy
 *  @property {(alias: string) => boolean} has
 *  @property {(alias: string) => SetupUpdates | false} getApp
 *  @property {(alias: string) => boolean | undefined} isEmpty
 *  @property {() => string[]} list
 *  @property {() => void} reset
 */
/**
 *  @function VisualController - Visual Controller for Vue 3
 *  @param {Object} [dependencies={}] - Optional external dependencies to inject into Vue apps
 *  @returns {VisualControllerInstance} Controller instance
 */
declare function VisualController(dependencies?: any): VisualControllerInstance;
export default VisualController;
