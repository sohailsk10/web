window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

var running = false,
  name = "",
  email = "",
  dept_custom = "Custom"
  server_api = 'https://ac-cbfe-d1.zu.ac.ae/chatbot',
  // server_api = 'http://127.0.0.1:8000/chatbot',
  greeting_id = "8",
  reset_id='7',
  livechat_id = "6",
  no_answer_id = "5",
  right_answer_id = "4",
  message_box = document.getElementById('message-box');

var response_list = [];
var intents_list = [];

function send() {
  if (running == true) return;
  var msg = document.getElementById("message").value;
  if (msg == "") return;
  running = true;
  addMsg(msg, true);
}

function startSr() {
  const recognition = new SpeechRecognition();
  var speech = true;
  var transcript;

  recognition.interimResults = false;

  recognition.addEventListener('result', e => {
    transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('')
    addMsg(transcript, true);
  });

  if (speech == true) {
    recognition.start();
  }
}

function addMsg(_msg, _spell_check = true) {
  var msg = _msg.textContent;
  if (msg === undefined) {
    msg = _msg;
  }

  var div = document.createElement("div");
  div.innerHTML =
    "<span style='flex-grow:1'></span><div class='chat-message-sent'>" +
    msg +
    "</div>";
  div.className = "chat-message-div";
  document.getElementById("message-box").appendChild(div);

  document.getElementById("message").value = "";
  document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight;

  //LOADER START
  var loader = document.createElement("div");
  loader.innerHTML = '<div title="getting response..."><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve"><rect x="0" y="10" width="4" height="10" fill="grey" opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /></rect><rect x="8" y="10" width="4" height="10" fill="grey"  opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /></rect><rect x="16" y="10" width="4" height="10" fill="grey"  opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /></rect></svg></div>';
  loader.className = "chat-message-received loader";
  document.getElementById("message-box").appendChild(loader);
  document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight;
  //LOADER END

  prev_msg = document.getElementById('message-box').children[document.getElementById('message-box').children.length - 3].textContent;
  console.log('PREV MSG', prev_msg);

  if (msg.toLowerCase() == "yes") {
    if (prev_msg == "Yes / No") {
      transferLiveChat();
    }
    else if (prev_msg == "Are you satisfied with the Chatbot's Response? Answer with 'Yes' or 'No'.") {
      removeLoader();
      var length_ = document.getElementById('message-box').children;
      // console.log("LENGHT" + length_)
      var ques = length_[length_.length - 4].textContent;
      var _data1 = { 'user_email': email, 'event_type': greeting_id, 'event_question': ques, 'event_answer': "Thank You for your co-operations with us.", 'session_value': '', 'intent': dept_custom };
      var _data2 = { 'user_email': email, 'event_type': greeting_id, 'event_question': ques, 'event_answer': "Please feel free to ask any other questions.", 'session_value': '', 'intent': dept_custom };
      setTimeout(addResponseMsg, 500, "Thank You for your co-operations with us.", true, _data1);
      setTimeout(addResponseMsg, 1000, "Please feel free to ask any other questions.", true, _data2);
    }
    else if (prev_msg.includes('Did you mean')) {
      removeLoader();
      _msg = document.getElementById('message-box').children[document.getElementById('message-box').children.length - 2].textContent.split("'")[1];
      console.log('MSG', _msg);
      addMsg(_msg, false);
    }
  }

  else if (msg.toLowerCase() == "no") {
    if (prev_msg == "Yes / No") {
      ask_another()
    }
    else if (prev_msg == "Are you satisfied with the Chatbot's Response? Answer with 'Yes' or 'No'.") {
      removeLoader();
      var length_ = document.getElementById('message-box').children;
      // send wrong answer to db
      var ques = length_[length_.length - 4].textContent;
      var ans = response_list[0];
      var intent = intents_list[0];
      var data = { 'user_email': email, 'event_type': '', 'event_question': ques, 'event_answer': ans, 'intent': intent };
      fetch(server_api + "/wrong_answer/", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }).then(res => {
        res.text().then(function (text) { })
      });
      var _data1 = { 'user_email': email, 'event_type': livechat_id, 'event_question': ques, 'event_answer': "Do you want to talk with our Human Agent? please <strong>Click</strong> on either Yes or No", 'session_value': '', 'intent': dept_custom };
      setTimeout(addResponseMsg, 500, "Do you want to talk with our Human Agent? please <strong>Click</strong> on either Yes or No", false, _data1)
      setTimeout(addResponseMsg, 1000, "<p onclick='transferLiveChat()'>Yes</p> / <p onclick='ask_another()'>No</p>")
    }
    else if (prev_msg.includes('Did you mean')) {
      removeLoader();
      _msg = document.getElementById('message-box').children[document.getElementById('message-box').children.length - 3].textContent;
      // console.log('MSG', _msg);
      addMsg(_msg, false);
    }
  }

  else sendInputToWatson(msg, _spell_check);
}

function addOnlyMsg(msg) {
  // console.log("Message" +  msg)
  var _tmp = msg.split("`");
  // console.log("138", _tmp);
  // console.log("139", _tmp[1]);
  _spell = false;
  var div = document.createElement("div");
  div.innerHTML = "<span style='flex-grow:1'></span><div class='chat-message-sent'>" + _tmp[0] + "'<b style='text-decoration: underline;cursor: pointer;' onclick='addMsg(this,false)'>" + _tmp[1] + "</b>'</div>";
  div.className = "chat-message-div";
  document.getElementById("message-box").appendChild(div);

  document.getElementById("message").value = "";
  document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight;
  running = false;
}

function sendInputToWatson(input, _spell) {
  var data = { 'user_email': email, 'event_type': '4', 'event_question': input, 'session_value': '', 'intent': '', 'spell_check_bool': _spell },
    unknown = "I didn't quite get that. Please rephrase your query.",
    sorry = "Sorry, I am not able to detect the language you are asking.",
    api = server_api + "/watson-assistant/";

  // console.log(data);

  fetch(api, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => {
    res.text().then(function (text) {
      if (res.status == 200) {
        removeLoader();
        // console.log(JSON.parse(text));

        if (JSON.parse(text).intent != "spell") {
          response_list.push(JSON.parse(text).answer);
          intents_list.push(JSON.parse(text).intent);
        }

        if (JSON.parse(text).intent != "spell") {
          for (var i = 0; i < response_list.length; i++) {
            if (response_list[i] != JSON.parse(text).answer) {
              response_list = [];
              intents_list = [];
              response_list.push(JSON.parse(text).answer);
              intents_list.push(JSON.parse(text).intent);
              // const linkRegex = /(https?:\/\/[^\s]+)/g;
              // const links = paragraph.match(linkRegex);
              // console.log(links);
            }
          }
        }

        // console.log(dept);
        // if (JSON.parse(text).intent != "Greetings") {
        //   response_list.push(JSON.parse(text).answer);
        //   intents_list.push(JSON.parse(text).intent);
        // }

        // console.log(JSON.parse(text).answer.toLowerCase());
        // console.log(sorry);
        // console.log(JSON.parse(text).answer.toLowerCase() == sorry);
        // console.log("194", response_list);

        if (JSON.parse(text).answer.toLowerCase() == sorry.toLowerCase()) {
          var _data1 = { 'user_email': email, 'event_type': no_answer_id, 'event_question': input, 'event_answer': "Sorry, We could not recognize the question you've asked for. Kindly let us know if we help with anything else.", 'session_value': '', 'intent': dept_custom };
          addResponseMsg("Sorry, We could not recognize the question you've asked for. Kindly let us know if we help with anything else.", false, _data1);
          var _data2 = { 'user_email': email, 'event_type': livechat_id, 'event_question': input, 'event_answer': "In order to Transfer the same conversation to Live Agent Click from below.", 'session_value': '', 'intent': dept_custom };
          addResponseMsg("In order to Transfer the same conversation to Live Agent Click from below.", true, _data2);
          addResponseMsg("<p onclick='transferLiveChat()'>Yes</p> / <p onclick='ask_another()'>No</p>");
          //addResponseMsg("<a href='https://live-test-772cf.web.app/' target='_blank'>Yes</a> / <a href='#' onclick='ask_another()'>No</a>");
          //addResponseMsg("<a href='#' onclick='ask_another()'>No</a>");
        }

        else {
          // console.log(JSON.parse(text).intent == dept);
          // if (JSON.parse(text).intent == "Greetings")
          // console.log(JSON.parse(text).intent.toLowerCase(), dept.toLowerCase());
          // console.log(JSON.parse(text).intent.toLowerCase() == dept.toLowerCase());

          // NEW CODE
          if (JSON.parse(text).intent.toLowerCase() != '') {
            if (response_list[0] == JSON.parse(text).answer && response_list.length >= 2) {
              if (JSON.parse(text).intent.toLowerCase() == "general" && JSON.parse(text).url != undefined) {
                addResponseMsgWithUrl(JSON.parse(text).answer, JSON.parse(text).url, true, _data1, input);
              }
              else {
                var _data1 = { 'user_email': email, 'event_type': right_answer_id, 'event_question': input, 'event_answer': JSON.parse(text).answer, 'session_value': '', 'intent': JSON.parse(text).intent };
                addResponseMsg(JSON.parse(text).answer, false, _data1);
              }
              var _data1 = { 'user_email': email, 'event_type': greeting_id, 'event_question': input, 'event_answer': "Are you satisfied with the Chatbot's Response? Answer with 'Yes' or 'No'.", 'session_value': '', 'intent': dept_custom };
              setTimeout(addResponseMsg, 500, "Are you satisfied with the Chatbot's Response? Answer with 'Yes' or 'No'.", true, _data1);
            }

            else if (JSON.parse(text).intent.toLowerCase() == "general" && JSON.parse(text).url != undefined) {
              addResponseMsgWithUrl(JSON.parse(text).answer, JSON.parse(text).url, true, _data1, input);
            }

            else if (JSON.parse(text).intent.toLowerCase() == "general") {
              var _data1 = { 'user_email': email, 'event_type': right_answer_id, 'event_question': input, 'event_answer': JSON.parse(text).answer, 'session_value': '', 'intent': JSON.parse(text).intent };
              addResponseMsg(JSON.parse(text).answer, true, _data1);
            }

            else if (JSON.parse(text).intent.toLowerCase() == "spell") {
              var _data1 = {};
              addOnlyMsg("Did you mean `" + JSON.parse(text).answer + "`. Please type Yes or No.");
            }
            

            else if (JSON.parse(text).intent == "Live_Agent") {
              var _data1 = { 'user_email': email, 'event_type': livechat_id, 'event_question': input, 'event_answer': JSON.parse(text).answer, 'session_value': '', 'intent': JSON.parse(text).intent };
              addResponseMsg(JSON.parse(text).answer, true, _data1);
              setTimeout(transferLiveChat, 3000)
            }

            else {
              var _data1 = { 'user_email': email, 'event_type': right_answer_id, 'event_question': input, 'event_answer': JSON.parse(text).answer, 'session_value': '', 'intent': JSON.parse(text).intent };
              addResponseMsg(JSON.parse(text).answer, false, _data1);
            }


            // for (var i = 0; i < response_list.length; i++) {
            //   if (response_list[i] != JSON.parse(text).answer) {
            //     response_list = [];
            //     intents_list = [];
            //     response_list.push(JSON.parse(text).answer);
            //     intents_list.push(JSON.parse(text).intent);
            //     break
            //   }

            //   else if (response_list[i] == JSON.parse(text).answer && response_list.length >= 3) {

            //     if (JSON.parse(text).intent.toLowerCase() == "general") {
            //       addResponseMsgWithUrl(JSON.parse(text).answer, JSON.parse(text).url);
            //     } else {
            //       addResponseMsg(JSON.parse(text).answer);
            //     }

            //     setTimeout(addResponseMsg, 500, "Are you satisfied with the Chatbot's Response? Answer with 'Yes' or 'No'.");
            //     break;
            //   }

            //   else if (JSON.parse(text).intent.toLowerCase() == "general") {
            //     addResponseMsgWithUrl(JSON.parse(text).answer, JSON.parse(text).url);
            //     break;
            //   }

            //   else {
            //     addResponseMsg(JSON.parse(text).answer);
            //     break;
            //   }
            // }
          }

          else if (JSON.parse(text).intent == "Greetings") {
            var data = { 'user_email': email, 'event_type': greeting_id, 'event_question': input, 'event_answer': JSON.parse(text).answer, 'session_value': '', 'intent': JSON.parse(text).intent };
            // console.log(data);
            addResponseMsg(JSON.parse(text).answer, true, data);
          }

          else {
            var _data1 = { 'user_email': email, 'event_type': greeting_id, 'event_question': input, 'event_answer': "Please ask questions according to the Department You selected.", 'session_value': '', 'intent': dept_custom };
            addResponseMsg("Please ask questions according to the Department You selected.", true, _data1);
          }
        }
      }

      else {
        removeLoader();
        var _data1 = { 'user_email': email, 'event_type': no_answer_id, 'event_question': input, 'event_answer': unknown, 'session_value': '', 'intent': dept_custom };
        addResponseMsg(unknown, true, _data1);
      }
    });
  });
}

function transferLiveChat() {
  //logout
  var data = { 'user_email': email, 'event_type': '2', 'event_question': '', 'event_answer': '', 'intent': 'Logout' };
  fetch(server_api + "/reset/", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => {
    res.text().then(function (text) {
    })
  });

  // live chat count
  var data = { 'user_email': email, 'event_type': '6', 'event_question': '', 'event_answer': '', 'intent': "LiveChat" };
  fetch(server_api + "/reset/", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => {
    res.text().then(function (text) {
    })
  });

  document.getElementById("chatbot").classList.add("collapsed")
  document.getElementById("chatbot_toggle").children[0].style.display = "inline-block"
  document.getElementById("chatbot_toggle").children[1].style.display = "none"
  document.getElementById("chatbot").children[1].style.display = "none"
  document.getElementById("chatbot").children[4].style.display = "none"
  document.getElementById("chatbot_toggle").style.backgroundColor = "white"

  window.__lc = window.__lc || {};
  window.__lc.license = 13510746;;

  (function (n, t, c) {
    function i(n) {
      return e._h ? e._h.apply(null, n) : e._q.push(n)
    }

    var e = {
      _q: [],
      _h: null,
      _v: "2.0",

      on: function () {
        i(["on", c.call(arguments)])
      },

      once: function () {
        i(["once", c.call(arguments)])
      },

      off: function () {
        i(["off", c.call(arguments)])
      },

      get: function () {
        if (!e._h) throw new Error("[LiveChatWidget] You can't use getters before load.");
        return i(["get", c.call(arguments)])
      },

      call: function () {
        i(["call", c.call(arguments)])
      },

      init: function () {
        var n = t.createElement("script");
        n.async = !0, n.type = "text/javascript", n.src = "https://cdn.livechatinc.com/tracking.js", t.head.appendChild(n)
      }

    };

    !n.__lc.asyncInit && e.init(), n.LiveChatWidget = n.LiveChatWidget || e

  }(window, document, [].slice))

  var divs = document.getElementById("message-box").children;
  var msgs = [];
  for (i = 0; i <= divs.length - 4; i++) {
    msgs.push(divs[i].innerText);
  }

  window.LiveChatWidget.call("set_customer_name", user_name);
  window.LiveChatWidget.call("set_customer_email", email);
  window.LiveChatWidget.call("maximize");
  window.LiveChatWidget.call("set_session_variables", {
    customer_chat: msgs
  });
}

function ask_another() {
  removeLoader();
  addResponseMsg("If you have any other questions, feel free to ask it.");
}

function removeLoader() {
  message_box.lastChild.remove();
}

function addLink(str) {
  // Regular expression to match URLs
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Replace URLs with hyperlinks
  return str.replace(urlRegex, function(url) {
    return '<a href="' + url + '"target = "_blank">'  + url + '</a>';
  });
}

function addLink_email(str) {
  // Regular expression to match URLs
  var urlRegex = /([a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9._-]+)/g;
  
  // Replace URLs with hyperlinks
  return str.replace(urlRegex, function(url) {
    return '<a href="mailto:' + url + '">'  + url + '</a>';
  });
}


function addResponseMsg(msg_, _commit, _data) {
  var link_msg = addLink(msg_);
  var msg = addLink_email(link_msg);
  var div = document.createElement("div");
  div.innerHTML = "<div class='chat-message-received'>" + msg + "</div>";
  div.className = "chat-message-div";
  document.getElementById("message-box").appendChild(div);
  document.getElementById("message-box").scrollTop = document.getElementById(
    "message-box"
  ).scrollHeight;
  running = false;

  if (_commit) {
    fetch(server_api + "/reset/", {
      method: "POST",
      body: JSON.stringify(_data),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => {
      res.text().then(function (text) {
      })
    });
  }
}

function addResponseMsgWithUrl(msg, url, _commit, _data, _input) {

  var urls = ""

  // console.log(url);

  url.forEach(element => {
    urls += "<a href='" + element + "' target='_blank' style='text-decoration: underline; color: blue;'>" + element + "</a><br /><br />"
  });

  var div = document.createElement("div");
  div.innerHTML = "<div class='chat-message-received more' id='minimize'>" + urls + "<br />Please click on the link above to get more details.<br/><br/></div>";
  div.className = "chat-message-div";
  document.getElementById("message-box").appendChild(div);
  document.getElementById("message-box").scrollTop = document.getElementById(
    "message-box"
  ).scrollHeight;
  running = false;

  var _urls = "";

  url.forEach(element => {
    _urls += element + "\n"
  });

  // console.log(_urls);

  var _data = { 'user_email': email, 'event_type': right_answer_id, 'event_question': _input, 'event_answer': _urls, 'session_value': '', 'intent': 'General' };

  if (_commit) {
    fetch(server_api + "/reset/", {
      method: "POST",
      body: JSON.stringify(_data),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => {
      res.text().then(function (text) {
      })
    });
  }
}

document.getElementById("message").addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    send();
  }
});

document.getElementById("chatbot_toggle").onclick = function () {
  if (document.getElementById("chatbot").classList.contains("collapsed")) {
    document.getElementById("chatbot").classList.remove("collapsed")
    document.getElementById("chatbot_toggle").children[0].style.display = "none"
    document.getElementById("chatbot_toggle").children[1].style.display = ""
    document.getElementById("chatbot").children[1].style.display = ""

    if (document.getElementById("cred-form").classList.contains("inactive")) {
      document.getElementById("chatbot").children[3].style.display = ""
      document.getElementById("chatbot").children[4].style.display = ""
      document.getElementById("chatbot").children[5].style.display = ""
    } else {
      document.getElementById('refreshbtn').style.display = "none"
      document.getElementById("chatbot").children[3].style.display = "none"
      document.getElementById("chatbot").children[4].style.display = "none"
      document.getElementById("chatbot").children[5].style.display = "none"
    }

    document.getElementById("cred-form").style.display = ""
    document.getElementById("chatbot_toggle").style.backgroundColor = "transparent"
    document.getElementById("user-name").focus();
    //if (checkWelcomeMsg()) setTimeout(addResponseMsg,1000,"Hi, This is Zayed University AI Chatbot.")
  }

  else {
    var msgs = document.getElementById("message-box");
    while (msgs.lastChild) msgs.removeChild(msgs.lastChild);
    document.getElementById("cred-form").classList.remove("inactive")
    document.getElementById("cred-form").classList.add("active")
    document.getElementById("chatbot").classList.add("collapsed")
    document.getElementById("chatbot_toggle").children[0].style.display = "inline-block"
    document.getElementById("chatbot_toggle").children[1].style.display = "none"
    document.getElementById("chatbot").children[1].style.display = "none"
    document.getElementById("cred-form").style.display = "none"
    document.getElementById("chatbot").children[4].style.display = "none"
    document.getElementById("chatbot_toggle").style.backgroundColor = "white"
  }
}

function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function clear_chatbot() {
  var msgs = document.getElementById("message-box");
  db_commit = false;
  running = false;

  while (msgs.lastChild) {
    if (msgs.lastChild.textContent.includes("This is Zayed University AI Chatbot.")) break;
    else {
      db_commit = true;
      msgs.removeChild(msgs.lastChild);
    }
  }

  if (db_commit) {
    var data = { 'user_email': email, 'event_type': '7', 'event_question': '', 'intent': 'Reset' };
    fetch(server_api + "/login/", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => {
      res.text().then(function (text) {
      })
    });
  }
}

function validateEmail2(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return (true)
  }
  return (false)
}

function checkForm() {
  // console.log("In Check form")
  user_name = document.getElementById("user-name").value;
  email = document.getElementById("user-email").value;

  if (validateEmail2(email)) {
    if (user_name != '') {
      if (document.getElementById("cred-form").classList.contains("active")) {
        var data = { 'user_email': email, 'event_type': '1', 'event_question': '', 'intent': 'Login' };
        fetch(server_api + "/login/", {
          method: "POST",
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        }).then(res => {
          res.text().then(function (text) {
          })
        });

        document.getElementById("cred-form").classList.remove("active")
        document.getElementById("cred-form").classList.add("inactive")
        document.getElementById("chatbot").children[3].style.display = ""
        document.getElementById('refreshbtn').style.display = ""
        document.getElementById("chatbot").children[4].style.display = ""
        document.getElementById("chatbot").children[5].style.display = ""

        if (checkWelcomeMsg()) {
          setTimeout(addResponseMsg, 500, "Hi " + user_name + ", This is Zayed University AI Chatbot.")
        }
        document.getElementById("message").focus();
      }
    }
  }
}

function checkWelcomeMsg() {
  var list = document.getElementById("message-box").querySelectorAll('div');
  if (list.length == 0) return true;
  return false;
}

document.getElementById("chatbot_toggle").children[1].style.display = "none"
document.getElementById("chatbot").children[1].style.display = "none"
document.getElementById("chatbot").children[4].style.display = "none"
