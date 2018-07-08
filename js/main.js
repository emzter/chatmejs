var currentuser;

function onAuthStateChanged(user) {
  // if (user === user.uid) {
  //   return;
  // }

  if (user) {
    currentuser = user;
    writeUserData(currentuser.uid, currentuser.displayName, currentuser.email, currentuser.photoURL);
    bindView();
  } else {
    window.location.href = 'index.html';
  }
}

function bindView(){
  bindSidebar();
}

function bindSidebar(){
  $("#user-pic").attr('src', currentuser.photoURL);
  $("#user-name").html(currentuser.displayName);
}

function getalluser(){
  var userRef = firebase.database().ref('users');
  userRef.on('value', function(snapshot) {
    snapshot.forEach(function(userSnapshot){
      createUserElement(userSnapshot.val().id, userSnapshot.val().name, userSnapshot.val().email, userSnapshot.val().profilePic);
    });
  });
}

function getuser(id){
  var user = [];
  var userRef = firebase.database().ref('users/' + id);
  userRef.on('value',function(snapshot){
    //console.log(snapshot.val());
    user.push(snapshot.val());
  });
  return user;
}

function createUserElement(userId, name, email, imageUrl){
  var html =
  '<div class="user">' +
    '<div class="user-pic"><img class="img-circle" src="' + imageUrl + '" height="80" width="80"></div>' +
    '<div class="user-detail">' +
      '<div class="user-title">' + name + '</div>' +
      '<div class="user-subtitle">' + email + '</div>' +
    '</div>' +
  '</div>';

  var div = document.createElement('div');
  div.innerHTML = html;

  $('#friendlist').append(div);
}

function createChatElement(message, timestamp, author){
  timestamp = timeSince(timestamp);

  var leftChat =
  '<div class="left-chat">' +
    '<div class="left-chat-pic"><img class="img-circle" src="' + author[0].profilePic + '" height="40" width="40"></div>' +
    '<div class="left-chat-detail">' +
      '<div class="left-chat-header">' +
        '<strong>' + author[0].name + '</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span> ' + timestamp + '</small>' +
      '</div>' +
      '<hr>' +
      '<div class="left-chat-body">' +
        '<div class="left-chat-message">' + message + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  var rightChat =
  '<div class="right-chat">' +
    '<div class="right-chat-pic"><img class="img-circle" src="' + author[0].profilePic + '" height="40" width="40"></div>' +
    '<div class="right-chat-detail">' +
      '<div class="right-chat-header">' +
        '<strong>' + author[0].name + '</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span> ' + timestamp + '</small>' +
      '</div>' +
      '<hr>' +
      '<div class="right-chat-body">' +
        '<div class="right-chat-message">' + message + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  var div = document.createElement('div');
  var uid = firebase.auth().currentUser.uid;

  if(uid == author[0].id){
    div.innerHTML = rightChat;
  }else{
    div.innerHTML = leftChat;
  }

  $('#chatbox').append(div);
}

function timeSince(date) {

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

function startDatabaseQueries() {
  var recentMessagesRef = firebase.database().ref('messages').limitToLast(100);

  var chatRef = firebase.database().ref('messages');

  recentMessagesRef.on('child_added', function(snapshot) {
      var user = getuser(snapshot.child('user').val().id);
      createChatElement(snapshot.val().message, snapshot.val().timeStamp, user);
  });
}

function newPostForCurrentUser(text){
  var uid = firebase.auth().currentUser.uid;
  writeNewMessage(uid, text)
}

function writeNewMessage(uid, message) {
  new Date().getTime();
  var timeStamp = Date.now().toString();


  var messageData = {
    message: message,
    timeStamp: timeStamp,
    user: {
      id: uid
    }
  };

  var newMessageKey = firebase.database().ref().child('messages').push().key;
  var updates = {};
  updates['/messages/' + newMessageKey] = messageData;

  return firebase.database().ref().update(updates);
}

function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    id: userId,
    name: name,
    email: email,
    profilePic : imageUrl
  });
}

function login(){
  if (!firebase.auth().currentUser) {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    firebase.auth().signInWithPopup(provider).then(function(result) {
      window.location.href = 'main.html'
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
      } else {
        console.error(error);
      }
    });
  }else{
    firebase.auth().signOut();
  }
}

function logout(){
  firebase.auth().signOut();
}
