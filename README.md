 
   
#Welcome to the User Survey Program
 
Author: Thomas Johnson
Date: 12 November 2016





#Testing and Performance
Login Credentials Used for testing (case-sensitive please)
    Admin: Username - tjjohn1      | Password - password
    User:  Username - Thomas       | Password - password
    User:  Username - Michael      | Password - password
    User:  Username - Jessica      | Password - password
Running the application
    Run the survey.js file as a Node.js application
    The landing page at "localuser:3000" provides login for the admin or user
    You may also access certain locations with direct static links,
    provided you have authorization to do so

#Role Information
Admin - Accesses the /tools page following login
New User - Immediately directed to fill out survey at /survey/1
Previous User - Brought to the /matches page to view the other users and their ranked compatibilty based on similar answers
                Given access to view their previous survey results and given ability to repeat their previous survey


#Module/Middleware Information
Required Modules and Middleware
    - All required modules, middleware, and APIs are included (also Jade is now Pug)
      Specifically they are: express, express-session, pug, body-parser, cookie-parser, file
    

#Issues
2 Minute Survey Timeout 
    - I attempted many methods for achieving the 2 minute survey timeout, I ultimately did succeed in this requirement somewhat.  However the method
      I used caused not an immediate redirect back to the landing page, and instead it redirected on the next submit action.  I anticipate only partial
      or no credit for that attempt as a result.
Global Variables
    - I understand that the global variables are frowned upon, however I found it necessary to use several of them for a few critical reasons.
      1.  userAnswers array:  This array needed to be accessed globally since multiple functions needed to access the data, and the data needed to persist
                              I could have called the function each time, but it seemed inefficient to do so.
      2.  tempAnswers array:  This array needed to be accessed and changed across multiple routings, and thus needed to persist for storage purposes.
      3.  lastUser variable:  I could have misunderstood the requirement, but when the browser window is closed, the session ends.  Therefore I thought the
                              requirement meant for the alst logged on username to appear in the user field even if the browser window was closed and yet 
                              the server remains open for another browser window reopen.  Thus I needed the variable to be gloal and persisting.
      4.  timeVar variable:   I needed a global timeVar varaible to set the time interval for survey time out, and it needed to persist across multiple funcitons
                              and routings, thus I could not have it only be local or it would be unreliable.
      5.  timeOut boolean:    I needed an indicator to have the ability for being set in a function and yet be readily available for a reouting to picup on and
                              check, thus once again it needed to be accesible beyond the local scope and persisting.
