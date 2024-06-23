## Ping TimeOut

Do you have a role that everyone can ping that is regularly being spammed? Then this bot is for you! 

[Click here](https://discord.com/application-directory/1142452590685200565) to show the app on the discord app directory or [click here](https://discord.com/oauth2/authorize?client_id=114245259068520056) to invite the bot directly!


With this bot you can disable a role for a specific time so that people can only ping it every X amount of time.

---

### Setup
**Important**: You need to have the __Administrator__ permission for most of the commands. (Administrators can change slash command permissions under the intergration settings)
            
1. Check if the bot has all required permissions by using the _/setup_ command'.
2.  Use _/check_ to check for all roles that you can add a timeout to. 
3.  Use _/timed-role add_ to add a timeout to a role.
4. You can check if the bot work by following one of these steps: <br>
**4a.** Ping the role you added to be monitored. Then check with an account that doesn't have the mentione everyone permsissions if the role disappears and reappears after the set time. <br>
**4b.** Ping the role you added to be monitored. Then check in _Server Settings -> Audit Log_ if the role got updated by the bot to unmentionable.
5. Use _/roles_ to see the role(s) you added!

---
### Notes/Good to know
- All commands (except /ping and /roles) need the administrator perm by default! You can change it with the discord intergrations settings (Server Settings > Intergrations > Ping TimeOut).
- The bot checks if a role its timer has run out at the start of every minute so it could be that a bot doesn't get made mentionable again at the exact time has run out.
- People that have the ping @everyone permission do trigger the bot however due to this permission they can still ping the role. To check if the bot still works use step 4 in the setup guide.

---

### Commands
#### Main
- `/timed-role add` *Add a new role that should be monitored. (adminstrator)*
- `/timed-role edit` *Edit a role that already is being monitored. (adminstrator)*
- `/timed-role remove` *Remove a role from the monitored roles. (adminstrator)*
- `/timed-role reset-timer` *Resets the current timeout of a role. (adminstrator)*
- `/check` *Get a list of all roles that could be monitored by the bit. (adminstrator)*
- `/roles` *Get information of all roles currently being monitored. (manage messages)*
#### Help

- `/setup` *Show the the setup guide. (adminstrator)*
- `/help` *Show the default help page. (adminstrator)*
- `/help 1` *Show help page 1 (default). (adminstrator)*
- `/help permscheck` *Checks if the bot has all required permissions to function. (adminstrator)*
####
- `/bug-report` *Submit a bug report to the developer. (public)*
- `/feedback` *Submit feedback to the developer. (public)*
- `/ping` *Gives you the bots ping (public)*

---

### Minium Required permissions:
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
If you still need help after using and reading the _/help_ command feel free to ask for it in the [support server](https://sixie.xyz/sixie-discord)!

---

__This bot is online 24/7 and all commands are free to use.__
<br>
<sub>This code is distrubuted under the GNU Affero General Public License v3.0</sub>
<br><br>
<sup>Disclaimer: This bot has similar features as the ping timer bot. However because of its (at the time of writing) low up-time I decided to make a similar bot that I want to share with others </sup>
