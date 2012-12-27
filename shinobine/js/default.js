// 分割テンプレートの概要については、次のドキュメントを参照してください:
// http://go.microsoft.com/fwlink/?LinkID=232447
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    //var oauth = new OAuth.Client("https://api.twitter.com/oauth/request_token", "https://api.twitter.com/oauth/access_token", "http://mesolabs.com/", "6aQqwijng8OaOo1NuyBSQ", "VVPSDVDD492S15wowZHcJHAxBBuEfvDRVdAEEDb534I");
    //oauth.authenticate();

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: このアプリケーションは新しく起動しました。ここでアプリケーションを
                // 初期化します。
            } else {
                // TODO: このアプリケーションは中断状態から再度アクティブ化されました。
                // ここでアプリケーションの状態を復元します。
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: このアプリケーションは中断しようとしています。ここで中断中に
        // 維持する必要のある状態を保存します。アプリケーションが中断される前に 
        // 非同期操作を終了する必要がある場合は 
        // args.setPromise() を呼び出してください。
        app.sessionState.history = nav.history;
    };

    app.start();

    init().then(function (twitter) {
      var lastId;
      //twitter.getTimelines("home_timeline", null, function (err, tweets) {
      //  if (err) return console.log(err.message);
      //  tweets.reverse().forEach(function (tweet, index, array) {
      //    console.log("[" + tweet.created_at + "] @" + tweet.user.screen_name + " | " + tweet.text);
      //    lastId = tweet.id;
      //  });
      //});

      twitter.getSearch("tweets", { q: "ニコニコ動画" }).then(
        function complete(result) {
          result.statuses.reverse().forEach(function (tweet, index, array) {
            console.log("[" + tweet.created_at + "] @" + tweet.user.screen_name + " | " + tweet.text);
          });
        },
        function error(err) {
          console.log(err.message);
        }
      );

      setInterval(function () {
        var params = null;
        if (lastId) params = { since_id: lastId };
        twitter.getTimelines("home_timeline", params).then(
          function complete(tweets) {
            tweets.reverse().forEach(function (tweet, index, array) {
              console.log("[" + tweet.created_at + "] @" + tweet.user.screen_name + " | " + tweet.text);
              lastId = tweet.id;
            });
          },
          function error(err) {
            console.log(err.message);
          }
        );
      }, 60 * 1000);
    });


    function init() {
      return new WinJS.Promise(
        function (c, e, p) {
          var twitter = new Twitter.Client("6aQqwijng8OaOo1NuyBSQ", "VVPSDVDD492S15wowZHcJHAxBBuEfvDRVdAEEDb534I", "http://mesolabs.com/");
          if (window.localStorage.accounts) {
            var accounts = JSON.parse(window.localStorage.accounts);
            if (accounts[0]) {
              twitter.setAuthInfo(accounts[0]);
              c(twitter);
            } else {
              e(new Error("Cannot get account information."));
            }
          } else {
            twitter.authenticate().then(
              function complete(info) {
                window.localStorage.accounts = JSON.stringify([info]);
                c(twitter);
              },
              function error(err) {
                e(err);
              }
            );
          }
        });
    }

    
})();
