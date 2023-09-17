## Ping TimeOut

Do you have a freely pingable role that everyone can ping that is regally being spammed?

Then this bot is for you!

With this bot you can add a timer to specific roles so they can only be pinged every X amount of time.

---

#### Setup
**Important**: You need to have the __Administrator__ permission for most of the commands. (Administrators can change slash command permissions under the intergration settings)
            
1. Check if the bot has all required permissions by using _/help permscheck_ or running the _/setup_ command'.
2.  Use _/check_ to check for all roles that you can add a timeout to. 
3.  Use _/timed-role add_ to add a timeout to a role.

4. You can check if the bot work by following one of these steps: <br>
**4a.** If possible use a account that doesn't have the permission to ping @everyone and ping the role you want to timeout. Then check if they can ping the role directly again. <br>
**4b.** Check in _Server Settings -> Audit Log_ if the bot updated the role to Mentionable.

5. Use _/roles_ to see the role(s) you added!

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
If you still need help after using and reading the _/help_ command feel free to ask for it in the support server!

---

__This bot is online 24/7 and all commands are free to use.__
<br>
<sup>Disclaimer: This bot has similar features as the ping timer bot. However because of its (at the time of writing) low up-time I decided to make a similar bot that I want to share with others </sup>