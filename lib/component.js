const store = require('./store');

class Component {

    constructor (name, model = { }) {
        this.kind = name;
        this.model = model;

        store.get('components').set(this, new WeakMap());
    }

    of (entity) {
        return store.get('components').get(this).get(entity);
    }

    create (entity, data = { }) {

        if (typeof this.model === 'function') {

            if (Component.validate(this.model, data)) try {
                store.get('components').get(this).set(entity, new this.model(data));
            }
            catch (_) {
                store.get('components').get(this).set(entity, this.model(data));
            }
            finally {
                return data;
            }
            else {
                const expected = this.model.name.toLowerCase();
                const actual = typeof data;

                throw new TypeError(`Wrong type for component: expected ${ expected }, found ${ actual }`);
            }
        }
        else {
            const missing = [ ];
            const validated = { };

            for (const [ key, value ] of Object.entries(data)) {

                if (key in this.model && Component.validate(this.model[ key ], value)) {
                    validated[ key ] = value;
                }
                else {
                    const expected = this.model[ key ].name.toLowerCase();
                    const actual = typeof value;

                    throw new TypeError(`Wrong type for property "${ key }": expected ${ expected }, found ${ actual }`);
                }
            }

            store.get('components').get(this).set(entity, validated);

            return validated;
        }
    }

    update (entity, model) {
        return Object.assign(store.get('components').get(this).get(entity), model);
    }

    extend (model) {
        Object.assign(this.model, model);
    }
}

Component.validate = function validate (type, value) {
    switch (type) {
        case Array: return Array.isArray(value);
        case Boolean: return typeof value === 'boolean' || value instanceof Boolean;
        case Function: return typeof value === 'function' || value instanceof Function;
        case Map: return value instanceof Map;
        case Number: return typeof value === 'number' || value instanceof Number;
        case Object: return typeof value === 'object' || value instanceof Object;
        case Set: return value instanceof Set;
        case String: return typeof value === 'string' || value instanceof String;
        case Symbol: return typeof value === 'symbol';
        case WeakMap: return value instanceof WeakMap;
        case WeakSet: return value instanceof WeakSet;
        default: return false;
    }
};

Object.defineProperty(Component, 'kinds', {
    get () {
        return store.get('components').values();
    }
});

module.exports = Component;
