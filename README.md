# חמל כביסות
We're making a very simple webapp to act as a project manager for the חמל כביסות. The way it works:
- on the admin page, the admin can create two kinds of tasks: a pickup task and a laundry task.
- The pickup task has a string location and a time and an empty assignee
- The laundry task has an int approximate number of loads, a pickup location, and a due date
- the admin can also delete the tasks

On the main page:
- when the user goes to the page for the first time, it will ask their name and save it in a cookie
- the user can assign themselves to the pickup task by writing their name
- the user can choose from the laundry task how many loads they can take on
  - this will create a new task containing the user's name and the number of loads and a status (pending, picked up, laundering, clean, dropped off)
  - the laundry task will reduce the number of loads available based on the number the user chose
- the user can edit the status


# language
The whole webapp will be in Hebrew

# style
The style should be simple and easy to use on the go from a phone
