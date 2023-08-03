/*globals CustomEvent*/
import Pickr from '@simonwep/pickr';
import observer from '@cocreate/observer';
import crud from '@cocreate/crud-client';
import '@simonwep/pickr/dist/themes/monolith.min.css';

let config = {
    el: '.color-picker', // will be replaced in observer
    container: 'body',
    theme: 'monolith', // or 'monolith', or 'nano'
    position: 'bottom-start',
    defaultRepresentation: 'HEX',
    inline: false,
    comparison: true,
    // default: '#999999',
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
        'rgba(63, 81, 181, 0.8)',
        'rgba(33, 150, 243, 0.75)',
        'rgba(3, 169, 244, 0.7)',
        'rgba(0, 188, 212, 0.7)',
        'rgba(0, 150, 136, 0.75)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(139, 195, 74, 0.85)',
        'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.95)',
        'rgba(255, 193, 7, 1)'
    ],

    components: {

        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
            hex: true,
            rgba: true,
            hsla: true,
            hsva: true,
            cmyk: true,
            input: true,
            clear: false,
            save: false
        }
    }
};


let refs = new Map();

observer.init({
    name: "pickr",
    observe: ['addedNodes'],
    target: '.color-picker',
    callback: (mutation) => {
        createPickr(mutation.target);
    },
});

function init() {
    let colorPickers = document.querySelectorAll('.color-picker');

    if (colorPickers.length) {
        colorPickers.forEach(p => createPickr(p));
    }
}

crud.listen('update.object', function (data) {
    const { array, object, data: responseData } = data;
    let pickrs = document.querySelectorAll(`.pickr[array="${array}"][object="${object}"]`);
    for (let pickr of pickrs) {
        const name = pickr.getAttribute('name');
        if (responseData[name]) {
            CoCreatePickr.refs.get(pickr).setColor(responseData[name]);
        }

    }
});

async function createPickr(p) {

    // pick attributes
    let attributes = p.attributes;

    let resp = await crud.read(p);
    if (resp) {
        let name = p.getAttribute('name');
        if (name && resp.object[name]) {
            config.default = crud.getValueFromObject(resp.object, name);
        }
    }

    // set element
    let disabledEvent;
    config.el = p;
    if (!config.el) {
        console.log(config);
        return;
    }
    // init and get root
    let pickr = Pickr.create(config);
    let element = pickr.getRoot().root;

    // write attributes
    for (let attribute of attributes) {
        if (attribute.value == 'color-picker') continue;
        element.setAttribute(attribute.name, attribute.value);
    }

    //set ref
    refs.set(element, {
        getColor() {
            return pickr.getColor().toHEXA().toString();
        },
        setColor(value) {
            window.aaa = [];

            let aa = setInterval(() => {
                window.aaa.push(value);
            }, 1);
            setTimeout(() => {
                clearInterval(aa);
            }, 1000);
            disabledEvent = true;
            pickr.setColor(value);
            disabledEvent = false;

        }

    });

    element.getValue = () => pickr.getColor().toHEXA().toString();
    element.setValue = (value) => pickr.setColor(value);

    //set events
    pickr.on('change', (instance, e, pickr) => {
        pickr.setColor(instance.toHEXA().toString());
    });

    pickr.on('changestop', (source, instance) => {
        save(instance);
        dispatchEvents(instance);
    });

    pickr.on('swatchselect', (source, instance) => {
        save(instance);
        dispatchEvents(instance);
    });

    function save(instance) {
        crud.save(element, instance.getColor().toHEXA().toString());
    }

    function dispatchEvents(instance) {
        if (instance && !disabledEvent) {
            let event = new CustomEvent("input", {
                bubbles: true,
                detail: {
                    color: instance.getColor().toHEXA().toString()
                },
            });
            element.dispatchEvent(event);
        }
    }


}

init();

const CoCreatePickr = { refs };
export default CoCreatePickr;
