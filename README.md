# Online Battleship

## Specification Deliverable
### Elevator Pitch
Have you ever wanted to play battleship with a friend but did not have the game with you? Or maybe you were too far away to play in person? Online battleship allows you to play a game of battleship with a friend over the internet. Players are able to place thier ships and then take turns trying to sink each others ships. See if you are the best naval commander between all of your friends!

### Design
<img src="/specificationDesign.jpg" alt="Design Image" width="350"/>

### Key Features
- Secure login over HTTPS
- Ability to create or join a game
- Place ships of different sizes on a matrix representing the battleship board
- Realtime turn by turn gameplay between you and your oppenent
- Updates hits and misses based on battleship
- Previous game history is stored

### Technologies
I am going to use the required technologies in the following ways:
- **HTML** - Correct use of HTML structure. Three HTML pages, one for login/create account, one for creating/joining a game, and one for playing the game.
- **CSS** - Application styling that looks good on different screen sizes, uses good whitespace, color choice and contrast. Make sure the matrix displaying the ships, hits, an misses looks good.
- **JavaScript** - Login/create accounts. Logic for placing ships, attacking, and game logic. Update moves/opponents moves and backend endpoint calls.
- **Service** - Backend service with endpoints for:
    - login/create account
    - setting ship placement/moves
    - retrieving oppenents ship placements/moves
- **DB/Login** - Stores users, game instances, and game history. Register and login users. Credentials securely stored in database. Can't play unless authenticated.
- **WebSocket** - Connection between players, real-time grid updates, and turn switching.
- **React** - Application ported to use the React web framework.

## HTML Deliverable
For this deliverable I built out the structure of my application using HTML.
- **HTML** - Four HTML Pages that represent logining in, creating/joining a game, playing the game, and the users personal leaderboard.
- **Links** - The login Page automatically goes to the create/join game page and that page goes to the current game page when the information is filled out and the button is clicked. Then all pages are connected through a navigation menu.
- **Text** - I am not exactly sure what this is looking for but logging in with your username, password, and creating/joining games ask for input as text in there respective forms. Also, the leaderboard is written in text.
- **3rd-Party API** - I will be calling the Colormind API to get a contrasting color from the battleship boards background color. This allows the user to play around with different color options and find contrasting colors while waiting for their opponents turn.
- **Images** - Victory and defeat images (defeat image is used in dummy data). This image will overlay the board depending on if you win or lose.
- **DB/Login** - Input box and submit button for login. The personal leaderboard represents data pulled from the database.
- **WebSocket** - Players will connect to each other using WebSocket. Also, the battleship board will be updated in real-time by using a WebSocket.

## CSS Deliverable 

[x] - done - Prerequisite: Simon CSS deployed to your production environment.  
[x] - done - Prerequisite: A link to your GitHub startup repository prominently displayed on your application's home page.  
[x] - done - Prerequisite: Notes in your startup Git repository README.md file.
[x] - done - Prerequisite: At least 10 git commits spread consistently throughout the assignment period.    
[x] - done - 30% Header, footer, and main content body. Used flex to layout sections.  
[x] - done - 20% Navigation elements. Links highlight on hover.  
[x] - done - 10% Responsive to window resizing. Looks great on iPad, desktop, and iPhone.  
[x] - done - 20% Application elements. Navigation and buttons are using bootstrap.  
[x] - done - 10% Application text content. Text is displaying in Helvetica font.  
[] - done - 10% Application images.  