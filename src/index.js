import Pickr from '@simonwep/pickr';
import observer from '@cocreate/observer'

// Simple example, see optional options for more configuration.
let config = {
    el: null, // will be replaced in observer
    theme: 'monolith', // or 'monolith', or 'nano'
    position: 'bottom-start',
    defaultRepresentation: 'HEX',
    inline: false,
    comparison: true,
    default: '#999999',
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
}

const eventHandler = root => (instance, e, pickr) => {
    //todofix: what is pickr.disabledEvent??
    if (instance && !CoCreate.pickr.disabledEvent) {
        let event = new CustomEvent("input", {
            bubbles: true,
            detail: {
                color: instance.toHEXA().toString(),
            },
        });
        pickr.setColor(instance.toHEXA().toString())
        root.dispatchEvent(event);
    }
}
let refs = new Map();
const CoCreatePickr = { refs };

observer.init({
    name: "pickr",
    observe: ["childList"],
    include: ".color-picker",
    callback: (mutation) => {
        // let colorPickers = mutation.target.querySelectorAll('.color-picker');
        // if (colorPickers.length)
        //     colorPickers.forEach(p => createPickr(p))
        createPickr(mutation.target)
       
    },
})

window.addEventListener('load', () => {
    let colorPickers = document.querySelectorAll('.color-picker');
    if (colorPickers.length)
        colorPickers.forEach(p => createPickr(p))
})




function createPickr(p) {

    // pick attributes
    let ccAttributes = Array.from(p.attributes).filter(att => att.name.startsWith('data-style'))

    // if not for cocreate
    if (!ccAttributes.length) return;

    // set element
    config.el = p;

    // init and get root
    let pickr = Pickr.create(config);
    let root = pickr.getRoot().root;

    // write attributes
    ccAttributes.forEach(att => {
        root.setAttribute(att.name, att.value);
    })

    //set ref
    refs.set(root, pickr)

    //set events
    // pickr.on('save', eventHandler(root))
    pickr.on('change', eventHandler(root))

}

export default CoCreatePickr;