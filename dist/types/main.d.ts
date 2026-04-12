export default VisualController;
declare function VisualController(dependencies?: {}): {
    publish: (component: any, data: {
        isCustomElement?: boolean;
    }, id: string) => Promise<any>;
    destroy: (id: string) => boolean;
    getApp: (id: string) => object | false;
    has: (id: string) => boolean;
};
