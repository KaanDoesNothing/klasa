const GatewayStorage = require('./GatewayStorage');
const Type = require('../../util/Type');
const { Collection } = require('discord.js');

/**
 * <warning>GatewayDriver is a singleton, use {@link KlasaClient#gateways} instead.</warning>
 * Gateway's driver to make new instances of it, with the purpose to handle different databases simultaneously.
 */
class GatewayDriver extends Collection {

	/**
	 * @typedef {Object} GatewayDriverRegisterOptions
	 * @property {string} [provider = this.client.options.providers.default] The name of the provider to use
	 * @property {Schema} [schema] The schema to use for this gateway.
	 * @property {string|string[]|true} [syncArg] The sync args to pass to Gateway#sync during Gateway init
	 */

	/**
	 * @since 0.3.0
	 * @param {KlasaClient} client The Klasa client
	 */
	constructor(client) {
		super();

		/**
		 * The client this GatewayDriver was created with.
		 * @since 0.3.0
		 * @name GatewayDriver#client
		 * @type {KlasaClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });
	}


	/**
	 * Registers a new Gateway.
	 * @since 0.5.0
	 * @param {GatewayStorage} gateway The gateway to register
	 * @returns {this}
	 * @chainable
	 */
	register(gateway) {
		if (!(gateway instanceof GatewayStorage)) throw new TypeError(`You must pass a GatewayStorage instance, received: ${new Type(gateway)}`);
		if (!(gateway.name in this.client.options.gateways)) this.client.options.gateways[gateway.name] = {};
		this.set(gateway.name, gateway);
		return this;
	}

	/**
	 * Initializes all gateways from the queue
	 * @since 0.5.0
	 */
	async init() {
		await Promise.all([...this.values()].map(gateway => gateway.init()));
	}

	/**
	 * Sync all gateways
	 * @since 0.5.0
	 * @param {(string|string[])} [input] The arguments to pass to each Gateway#sync
	 * @returns {Promise<Array<Gateway>>}
	 */
	sync(input) {
		return Promise.all([...this].map(([key, gateway]) => gateway.sync(typeof input === 'undefined' ? this.client.options.gateways[key].syncArg : input)));
	}

	/**
	 * The GatewayDriver with all gateways, types and keys as JSON.
	 * @since 0.5.0
	 * @returns {Object}
	 */
	toJSON() {
		return {
			ready: this.ready,
			...Object.assign({}, [...this].map(([key, value]) => ({ [key]: value.toJSON() })))
		};
	}

	/**
	 * The stringified GatewayDriver with all the managed gateways.
	 * @since 0.5.0
	 * @returns {string}
	 */
	toString() {
		return `GatewayDriver(${[...this.keys()].join(', ')})`;
	}

}

module.exports = GatewayDriver;