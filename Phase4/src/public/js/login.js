var button = document.getElementById('btn_SI');
button.onclick = function() {
  location.assign('https://stackoverflow.com/questions/52229901/navigate-to-route-on-button-click/');
}

// const btn_SU = document.getElementById('btn_SU');
// const btn_SI = document.getElementById('btn_SI');

// btn_SU.addEventListener('click', function(e) {
//   fetch('/login/main', {method: 'POST'})
//     .then(function(response) {
//       if(response.ok) {
//         console.log('Click was recorded');
//         return;
//       }
//       throw new Error('Request failed.');
//     })
//     .catch(function(error) {
//       console.log(error);
//     });  
// });

// btn_SI.addEventListener('click', function(e) {
//   console.log('button was clicked');
// });

// //

// $('btn_SI').on('click', function() {
//   $.ajax({
//       url: "/login/sign-in",
//       type: "POST",
//       data: {"userID": userID.value, "userPW": userPW.value},
//       success: function(returned) {
//            console.log(returnet);
//       },
//       error: function() {
//             console.log("error")
//       }
//   });
// });

// $('btn_SU').on('click', function() {
//   $.ajax({
//       url: "/login/main",
//       type: "POST",
//       data: {"userID": userID.value, "userPW": userPW.value}, //send this to server
//       success: function(returned) {
//            console.log(returnet); // here can get the return of route
//       },
//       error: function() {
//             console.log("error")
//       }
//   });
// });