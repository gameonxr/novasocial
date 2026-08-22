function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockSendStoryReply({ existingConversation = null, conversationCreateFails = false, messageFails = false, blocked = false, notificationFails = false, text = 'A thoughtful story reply that is intentionally longer than forty characters for truncation.' }) {
  const events = [];
  let conversationId = existingConversation;
  if (conversationId) {
    events.push(`reuse-conversation:${conversationId}`);
  } else {
    if (conversationCreateFails) return { events: ['conversation.create.failed'], sent: false };
    conversationId = 'new-conversation';
    events.push('conversation.create', 'members.insert.parallel');
  }
  if (messageFails || blocked) {
    events.push(blocked ? 'message.throw:MESSAGING_BLOCKED' : 'message.throw:generic');
    events.push(blocked ? "toast:You can't send messages to this user" : 'toast:Reply send failed');
    return { events, sent: false, conversationId };
  }
  events.push(`message.insert.throwOnError:${conversationId}:📸 Replied to story: ${text}`);
  if (notificationFails) events.push('notification.failed.nonfatal');
  else events.push(`notification.story_reply:${text.slice(0, 40)}`);
  return { events, sent: true, conversationId };
}

function createInjectedStoryInteractionSeam(deps) {
  const calls = [];
  return {
    calls,
    reply(input) {
      calls.push('reply');
      return deps.reply(input);
    },
    reaction(input) {
      calls.push('reaction');
      return deps.reaction(input);
    },
  };
}

async function mockReactToStory({ replyFails = false, notificationFails = false }) {
  const events = [];
  if (replyFails) return { events: ['reply.failed'], reacted: false };
  events.push('reply.sent');
  if (notificationFails) events.push('notification.failed.nonfatal');
  events.push('toast:Reaction sent');
  return { events, reacted: true };
}

(async () => {
  const reused = await mockSendStoryReply({ existingConversation: 'c-existing' });
  const created = await mockSendStoryReply({});
  const blocked = await mockSendStoryReply({ existingConversation: 'c-existing', blocked: true });
  const failed = await mockSendStoryReply({ existingConversation: 'c-existing', messageFails: true });
  const createFailed = await mockSendStoryReply({ conversationCreateFails: true });
  const notifFailure = await mockSendStoryReply({ existingConversation: 'c-existing', notificationFails: true });

  assert(reused.sent && reused.conversationId === 'c-existing' && reused.events.includes('message.insert.throwOnError:c-existing:📸 Replied to story: A thoughtful story reply that is intentionally longer than forty characters for truncation.'), 'Existing one-to-one conversation must be reused and message inserted with throwOnError');
  assert(created.sent && created.events.includes('conversation.create') && created.events.includes('members.insert.parallel'), 'Missing conversation must create one and insert both members');
  assert(blocked.events.includes("toast:You can't send messages to this user") && !blocked.sent, 'Blocked message must show specific feedback and stop');
  assert(failed.events.includes('toast:Reply send failed') && !failed.sent, 'Generic message failure must show reply failure and stop');
  assert(createFailed.events.includes('conversation.create.failed') && !createFailed.sent, 'Conversation creation failure must stop before message insert');
  assert(notifFailure.sent && notifFailure.events.includes('notification.failed.nonfatal'), 'Notification failure must not invalidate a sent reply');
  assert(reused.events.some(event => event.startsWith('notification.story_reply:') && event.slice('notification.story_reply:'.length).length === 40), 'Story reply notification message must truncate to forty characters');

  const reaction = await mockReactToStory({});
  const reactionNotifFailure = await mockReactToStory({ notificationFails: true });
  const reactionReplyFailure = await mockReactToStory({ replyFails: true });
  assert(reaction.reacted && reaction.events.includes('toast:Reaction sent'), 'Reaction must delegate to reply and show success feedback');
  assert(reactionNotifFailure.reacted && reactionNotifFailure.events.includes('notification.failed.nonfatal'), 'Reaction notification failure must remain nonfatal');
  assert(!reactionReplyFailure.reacted && !reactionReplyFailure.events.includes('toast:Reaction sent'), 'Reaction reply failure must stop before success toast');

  const seam = createInjectedStoryInteractionSeam({ reply: mockSendStoryReply, reaction: mockReactToStory });
  const injectedReply = await seam.reply({ existingConversation: 'c-injected' });
  const injectedReaction = await seam.reaction({});
  assert(JSON.stringify(seam.calls) === JSON.stringify(['reply', 'reaction']), 'Injected Story interaction seam must dispatch reply and reaction owners explicitly');
  assert(injectedReply.sent && injectedReply.events.includes('message.insert.throwOnError:c-injected:📸 Replied to story: A thoughtful story reply that is intentionally longer than forty characters for truncation.'), 'Injected reply seam must preserve message insertion');
  assert(injectedReaction.reacted && injectedReaction.events.includes('toast:Reaction sent'), 'Injected reaction seam must preserve success feedback');

  console.log(JSON.stringify({ passed: true, reused, created, blocked, failed, createFailed, notifFailure, reaction, reactionNotifFailure, reactionReplyFailure, seam: { calls: seam.calls, injectedReply, injectedReaction } }, null, 2));
})();
