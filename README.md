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
