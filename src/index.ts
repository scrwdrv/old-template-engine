type template = {
    type: string;
    data: string;
}[];

export class Renderer {

    private template: template = [];

    constructor(id: string, template: string) {

        const scripts = template.match(/(?<=<script template>)(?:(?!<\/script>)[\s\S])+(?=<\/script>)/g),
            variables = template.match(/(?<=#{)((?![{}()])[\s\S])+(?=})/g);

        let templateArray = [];

        if (scripts) for (let i = 0, l = scripts.length; i < l; i++)
            templateArray.push({
                type: 'script',
                offset: [17, 9],
                index: template.indexOf(scripts[i]),
                data: scripts[i]
            }), template = template.replace(scripts[i], i.toString().repeat(scripts[i].length));

        if (variables) for (let i = 0, l = variables.length; i < l; i++)
            templateArray.push({
                type: 'variable',
                offset: [2, 1],
                index: template.indexOf(variables[i]),
                data: variables[i]
            }), template = template.replace(variables[i], i.toString().repeat(variables[i].length));

        templateArray.sort((a, b) => {
            return a.index - b.index;
        });

        for (let i = 0, last = 0, l = templateArray.length; i < l; i++) {
            switch (templateArray[i].type) {
                case 'script':
                    Object.prototype[`renderer_${id}_${i}`] = new Function(`let template = '';${templateArray[i].data};return template`);
                    break;
                case 'variable':
                    Object.prototype[`renderer_${id}_${i}`] = new Function(`return ${templateArray[i].data}`);
                    break
            }

            this.template.push({
                type: 'string',
                data: trim(template.slice(last, templateArray[i].index - templateArray[i].offset[0]))
            }, {
                type: templateArray[i].type,
                data: `renderer_${id}_${i}`
            });

            last = templateArray[i].index + templateArray[i].data.length + templateArray[i].offset[1];

            if (i === l - 1) this.template.push({
                type: 'string',
                data: trim(template.slice(last))
            });
        }

        if (!templateArray.length)
            this.template.push({
                type: 'string',
                data: trim(template)
            });

        for (let i = this.template.length; i--;)
            if (!this.template[i].data) this.template.splice(i, 1);

        function trim(str: string): string {
            return str.trim().replace(/[\n\r]/g, '').replace(/\s{2,}/g, '');
        }
    }

    render(content: { [key: string]: any }) {
        let result = '';
        for (let i = 0; i < this.template.length; i++)
            switch (this.template[i].type) {
                case 'string':
                    result += this.template[i].data;
                    break;
                default:
                    result += content[this.template[i].data]();
                    break;
            }
        return result;
    }
}
