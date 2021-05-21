import Pickr from '@simonwep/pickr';
import observer from '@cocreate/observer'
import crud from '@cocreate/crud-client'

// Simple example, see optional options for more configuration.
let config = {
    el: null, // will be replaced in observer
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

const saveColor = (color, element) => {

    const collection = element.getAttribute('data-collection');
    let name = element.getAttribute('name');
    const document_id = element.getAttribute('data-document_id');

    crud.updateDocument({
        collection,
        document_id,
        name,
        upsert: true, // creates a documentid if one does not exist
        data: {
            [name]: color
        },
    });
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

        mutation.target.querySelectorAll('.color-picker').forEach(el => {
            createPickr(el)
        })


    },
})

window.addEventListener('load', () => {
    let colorPickers = document.querySelectorAll('.color-picker');
    if (colorPickers.length) {
        colorPickers.forEach(p => createPickr(p))
    }

})

crud.listen('updateDocument', function(data) {
    console.log("updateDocument received", data.data[data.name])

    let pickrs = document.querySelectorAll('.pickr[data-collection="' + data.collection + '"][data-document_id="' + data.document_id + '"][name="' + data.name + '"]');
    // if (data.metadata == 'pickr-select') {
    for (let pickr of pickrs) {
        CoCreatePickr.refs.get(pickr).setColor(data.data[data.name]);
    }
    // }
})

async function createPickr(p) {

    // pick attributes
    let ccAttributes = Array.from(p.attributes).filter(att => att.name.startsWith('data') || att.name.startsWith('name'))

    // if not for cocreate
    if (!ccAttributes.length) return;

    if (p.getAttribute('data-document_id') !== '') {
        let collection = p.getAttribute('data-collection');
        let document_id = p.getAttribute('data-document_id');
        let name = p.getAttribute('name');
        let unique = Date.now();
        try {
            crud.readDocument({ collection: collection, document_id: document_id, event: unique });

            let { data: responseData, metadata } = await crud.listenAsync(unique);

        }
        catch (err) {
            console.error(err)
        }


        if (responseData) {
            config.default = responseData[name];
        }
    }

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
    pickr.on('change', eventHandler(root))
    pickr.on('changestop', (source, instance) => {
        saveColor(instance.getColor().toHEXA().toString(), instance.options.el);
    })

    pickr.on('swatchselect', (source, instance) => {
        saveColor(instance.getColor().toHEXA().toString(), instance.options.el);
    })

}

export default CoCreatePickr;
