## Ping TimeOut

Do you have a freely pingable role that everyone can ping that is regally being spammed?

Then this bot is for you! [Click here](https://discord.com/api/oauth2/authorize?client_id=1142452590685200565&permissions=275213716480&scope=bot%20applications.commands) to invite the bot to your server!

With this bot you can add a timer to specific roles so they can only be pinged every X amount of time.

---

#### Setup
1. First check with _/check_ to which roles you can add a timer. It also shows what roles already have a timer connected.
2. Add your first timer to a role with _/timed-role add [role] [duration] [magnitude]_. Example command _/timed-role add @mod 1 hour_. This makes it so that normal users can only ping the @mod role every hour.
3. Let a normal user ping the role and see if they can ping it again directly after or if they need to wait.

---
#### Notes/Good to know
- When you add the bot/add a timer/edit a timer the bot checks if the @everyone role can mention @everyone. If that is the case the bot will set that permission to false. This is to make sure that you don't get confused why people can still ping certain roles when they shouldn't be pingable. (I recommend never the mention @everyone permission on non-staff roles!)
- All commands (except /ping and /roles) need the administrator perm by default! You can change it in the slash command permission manager.

---

#### Commands
- `/check` *Get all roles that you can add a timer to and see if they arleady have a timer enabled* (administrator)

- `/timed-role add` *Add a timer to a role that hasn't one* (administrator)
- `/timed-role edit` *Edit a timer connected to a role* (administrator)
- `/timed-role remove` *Remove a timer from a role* (administrator)
- `/timed-role reset-timer` *Reset the timeout timer of a role back to zero* (administrator)

- `/roles` *Gives you info about all the timed roles* (manage messages permission)

- `/help` *Gives you the bots help page* (administrator)
- `/setup` *Gives you the bots setup instructions (administrator)

- `/ping` *Gives you the bots ping* (public)

---

#### Minium Required permissions:
- Manage Roles
- Read Messages/View Channels
- Send Messages
- Send Messages in Threads
- Embed Links
- Use External Emojis
- Use Slash Commands


_The bot can't manage roles that have a higher position than the bot itself. Make sure that the bots role always stays higher than the roles it manages_

---

#### Need help?

First try the bots _/help_ command. Hopefully that helps you on your way.
If you still need help after using and reading the _/help_ command feel free to ask for it in the support server (https://sixie.xyz/sixie-discord)!

---

__This bot is online 24/7 and all commands are free to use.__
<br>
<sub>This code is distrubuted under the GNU Affero General Public License v3.0</sub>
<br><br>
<sup>Disclaimer: This bot has similar features as the ping timer bot. However because of its (at the time of writing) low up-time I decided to make a similar bot that I want to share with others </sup>