export declare class Renderer {
    private template;
    constructor(id: string, template: string);
    render(content: {
        [key: string]: any;
    }): string;
}
