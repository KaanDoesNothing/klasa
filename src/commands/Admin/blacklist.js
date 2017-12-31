const { Command } = require('klasa');
const { Guild } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permLevel: 10,
			description: (msg) => msg.language.get('COMMAND_BLACKLIST_DESCRIPTION'),
			usage: '<User:user|Guild:guild> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, usersAndGuilds) {
		usersAndGuilds = new Set(usersAndGuilds);
		const usersAdded = [];
		const usersRemoved = [];
		const guildsAdded = [];
		const guildsRemoved = [];

		for (const userOrGuild of usersAndGuilds) {
			const type = userOrGuild instanceof Guild ? 'guild' : 'user';

			await this.client.configs.update(`${type}Blacklist`, userOrGuild.id, msg.guild);

			if (type === 'guild' && this.client.guildBlacklist.includes(userOrGuild.id)) guildsAdded.push(userOrGuild.name);
			else if (type === 'guild') guildsRemoved.push(userOrGuild.name);
			else if (type === 'user' && this.client.userBlacklist.includes(userOrGuild.id)) usersAdded.push(userOrGuild.username);
			else usersRemoved.push(userOrGuild.username);
		}

		return msg.sendMessage(msg.language.get('COMMAND_BLACKLIST_SUCCESS', usersAdded, usersRemoved, guildsAdded, guildsRemoved));
	}

};
