### Modes:

There should be three modes for the app, that the user can toggle

&#x09;1. Entry Mode: Used to enter the expense and income.

&#x09;2. Overview Mode: Used to see overview of the month

&#x09;3. History Mode: List of all Entries made so far (can be edited or deleted from here)

The default mode (Home Screen) should be the Entry Mode



### Currency:

&#x09;Dual Currency support: Euro (shown as euro symbol) and Pakistani Rupees (shown as Rs)

&#x09;\* Default Currency should be Rs

&#x09;\* It should be possible to toggle currency anytime

&#x09;\* It should be possible to change support currencies under Settings --> App Settings --> Currencies. Maximum 2 currencies can be selected at a time. 1 is also OK.

&#x09;

### UI:

&#x09;\* Dark theme, minilmalist UI.

&#x09;\* For Entry Mode

&#x09;	\* Objective is enter the expense and its category with as ease and less clicks as possible

&#x09;	\* There should be a comment textbox for the user (optional to fill)

&#x09;	\* Default Category Selection should be PK Groceries

&#x09;\* For Overview Mode: Multiple Graphs (details to follow)

&#x09;\* For History Mode: List of all entries made so far, from latest to oldest

&#x09;\* Three tabs at the bottom, "Entry", "Overview" and "History". Homescreen / startup screen should be showing the Entry Tab.

&#x09;\* There should be a Setting (Gear) Icon where the User can update settings for the app



### Entry Mode:

&#x09;\* Default selections:

&#x09;	\* Entry Type: Expense. For entering Income,  I need to toggle Expense

&#x09;	\* Category:

&#x09;		\* For Income: Salary

&#x09;		\* For Expenses: PK Groceries

&#x09;\* Category selection: Should be a drop down menu

&#x09;\* Comments Field: Free Text

&#x09;\* Entry Date by Default Today (the day expense added), however it should be possible to edit it to any other day (only in past, not in future though)

&#x09;\* Date Entry Flow:

&#x09;	1. Open App, it will load the Entry Mode Screen . If on other tab, switch back to Entry Mode

&#x09;	2. Enter Amount (should be shown on the App in big font). Should be possible to change currency (but subtly). If Income, toggle to Income. the entry field should be width enough to accommodate 6 digits viewing in mobile phone easily

&#x09;	3. Categorize the Expense / Income according to the defined categories

&#x09;	4. Free text box for Comments come up. Also the Date is mentioned as today (with the option to change it)

&#x09;	5. Some confirmation regarding successful completion of the operation. If fails to complete, pls inform the User nicely

&#x09;\* Entry field should be highlighted with a border (lighter shade). The inside of the border should be filled black (same as the screen around it)

### Overview Mode:

&#x09;\* The Overview Screen has multiple clickable buttons, clicking on it will reveal show the graph in full screen

&#x09;\* Each Graph will be for the duration of that month.

&#x09;\* It should be possible to toggle the Currency in any Overview Graph. Default should be Rs

&#x09;\* The following graphs will be there (name of the button will be what is mentioning below in quotation marks

&#x09;	\* "Monthly Summary": Ring Graph showing Total Income, the % Expenses and % Savings

&#x09;	\* "Expense Distribution":  It should consider ALL expenses categories

&#x09;	\* "PK Expense Distribution": It should consider all expenses categories other than "DE" and "DE Air Ticket". If I click on any category type in the graph, it should take me to the list of all expenses for that category for that particular month.

&#x09;	\* Clicking on a category also works the same way on "Expense Distribution" (not just "PK Expense Distribution")

&#x09;	\* "Expenses variation on Days": A bar graph showing the expenses on each day

&#x09;		\* expense on y-axis and date on x-axis

&#x09;		\* It should be possible to toggle this view for either a week or a month

&#x09;		\* for week starts on Mon and Ends on Sunday, for month start on 1st and end on 30th/31st

&#x09;		\* it should be possible to swipe the screen and go from one week / month to the other

&#x09;		\* Weekdays should be in one colour and weekend in another

&#x09;		\* Clicking on a specific day should list all the expenses for that specific day

&#x09;	\* "Yearly Overview":

&#x09;		\* Table showing below:

&#x09;			\* Total Salary

&#x09;			\* Total Savings

&#x09;			\* Total Expenses

&#x09;			\* Average Monthly Expense

&#x09;		\* Graph:

&#x09;			\* Bar graphs where bars for income and expenses for each month

&#x09;			// ignore this line for now \* Best Month highlighted TBD

&#x09;		 	// ignore this line for now \* Worst Month highlighted with TBD



### History Mode:

&#x09;\* The History mode shows all the entries made so far

&#x09;\* Expenses should be red, income should be green

&#x09;\* It should be possible to edit or delete any entry from the history mode (edit / delete both would need confirmation)

&#x09;\* The entry should be in the form of Date: Amount (with currency) : Category

&#x09;\* On the right hand side of the entry there should be an edit icon, clicking on it will allow the user to edit the entry (same way as entering data in the first instance)

&#x09;\* It should be possible to filter expenses based on

&#x09;	\* Date Range (To and From)

&#x09;	\* Expense Categories

&#x09;	\* Comment

&#x09;\* Similar as on Settings screen, there should be a back button on the History Screen, that takes me back to the previous screen (Either Overview or Edit)

### Expense Categories:

&#x09;\* DE

&#x09;\* Car

&#x09;\* Health

&#x09;\* PK Rent

&#x09;\* PK Maids

&#x09;\* PK Bills

&#x09;\* PK Groceries

&#x09;\* PK Dine Out / Delivery

&#x09;\* PK Others

&#x09;\* Clothing

&#x09;\* Educational

&#x09;\* Family Support

&#x09;\* DE Air Ticket

&#x09;\* Spende

&#x09;\* PK Others



### Income Categories:

&#x09;\* Salary

&#x09;\* Yearly Bonus

&#x09;\* Tax Return

&#x09;\* Health Insurance Return

&#x09;\* Gift

&#x09;\* Others

&#x09;



### Export Option:

&#x09;TBD



### Settings:

Under Setting there should be:

&#x09;\* Demo Data:

&#x09;	\* Load Demo Data: fills the app with sample entries spanning several months, so the user can explore every feature without using real data

&#x09;	\* While viewing demo data, every screen shows a banner making clear this is demo data, with a button to clear it

&#x09;	\* Clear Demo Data: removes the sample entries and restores the user's real data exactly as it was before Demo Data was loaded

&#x09;	\* Sign-in with Google is disabled while viewing demo data, so demo entries can never reach the real cloud account

&#x09;	\* Scan for Leftover Demo Entries: checks the user's real entries for any that match the sample demo data (in case demo data was ever accidentally mixed into the real data), and lets the user review and delete them

&#x09;\* Personal Info:

&#x09;	\* Name:

&#x09;	\* Gender: (Give "Male" and Female" as toggle options)

&#x09;	\* Date of Birth:

&#x09;\* Delete

&#x09;	\* Delete ALL Date Entries

&#x09;	\* Delete Personal Info

&#x09;\* App Settings:

&#x09;	\* Theme. Toggle Dark / Light Mode

&#x09;	\* Currencies: (default is PKR and EUR). Supported currencies are Rs, EUR, USD, Saudi Riyal, Canadian Dollar, Australian Dollar, GBP

&#x09;	\* Exchange Rate: For the second selected currency, an editable conversion rate to PKR, used to combine both currencies into one total on Overview and exports

&#x09;\* Expense Categories: Here it be possible to add / delete Expense Categories.

&#x09;\* Export Data

&#x09;	\* Export Monthly Overview as PDF

&#x09;	\* Export Yearly Overview as PDF

&#x09;\* About: (Read Only)

&#x09;	\* App Version

&#x09;	\* Developer Info

&#x09;	\* Share App (Give here the link to the GitHub.io live app which can be used to share with others)



## Backend Features



##### "Sign in with Google" + cloud sync —

### 

an optional Google sign-in in Settings that would sync the entries/settings to a cloud database, so a new phone or a cleared browser wouldn't lose the data

&#x09;\* Switch Account: sign into a different Google account without losing the data currently on the device

&#x09;\* Sign Out: stop syncing and keep using the app with the data that's already on the device

&#x09;\* Sync Status: a visible indicator (Syncing / Synced / Sync error) next to the signed-in account

&#x09;\* Sync Error Detail: if a sync fails, show the actual error with a "Copy error" button, so it can be reported without needing developer tools

##### PWA / Offline Support —

### 

the app is installable to the home screen like a native app, and continues to work (viewing and adding entries) without an internet connection

