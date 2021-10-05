const User = require('./User');
const Requester = require('../utils/Requester');
const MakeAPIMessage = require('../utils/MakeAPIMessage');

class Message {
	constructor (client, data) {
		this.client = client;
		this.parseData(data);
	}

	async reply (content) {
		if (typeof content === 'string') {
			const data = await Requester.create(this.client, `/channels/${this.channelId}/messages`, 'POST', true, {
				content,
				embeds: [],
				tts: false,
				sticker_ids: [],
				components: [],
				message_reference: {
					message_id: this.id,
					channel_id: this.channelId,
					guild_id: this.channel.guildId,
					fail_if_not_exists: this.client.options.failIfNotExists,
				},
				allowed_mentions: {
					parse: this.client.options.allowedMentions.parse,
					replied_user: this.client.options.allowedMentions.replied_user,
					users: this.client.options.allowedMentions.users,
					roles: this.client.options.allowedMentions.roles,
				},
			});
			return new Message(this.client, data);
		}

		content.message_reference = {
			message_id: this.id,
			channel_id: this.channelId,
			guild_id: this.channel.guildId,
			fail_if_not_exists: this.client.options.failIfNotExists,
		};

		if (!content.allowed_mentions) {
			content.allowed_mentions = {
				parse: this.client.options.allowedMentions.parse,
				replied_user: this.client.options.allowedMentions.replied_user,
				users: this.client.options.allowedMentions.users,
				roles: this.client.options.allowedMentions.roles,
			};
		}

		const data = await Requester.create(this.client, `/channels/${this.channelId}/messages`, 'POST', true, MakeAPIMessage.transform(content));
		return new Message(this.client, data);
	}

	async delete () {
		return Requester.create(this.client, `/channels/${this.channelId}/messages/${this.id}`, 'DELETE', true);
	}

	toString () {
		return this.content;
	}

	parseData (data) {
		if (!data) return;

		this.id = data.id;

		this.channel = this.client.caches.channels.get(data.channel_id);
		this.channelId = data.channel_id;

		this.content = data.content;
		this.embeds = data.embeds;
		this.tts = data.tts;
		this.pinned = data.pinned;
		this.type = data.type;

		this.author = new User(this.client, data.author);
	}
}
module.exports = Message;