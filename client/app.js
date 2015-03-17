var app = angular
  .module("upvoter", ['ngRoute']);

app .config([
  "$routeProvider", 
  function($routeProvider){
    $routeProvider
      .when ('/', {
        templateUrl: "home.html",
        controller : "homeController",
        resolve : {
          postPromise: ["posts", function(posts){
            return posts.fetchAll();}]
        }
      })
      .when('/topic/:id', {
        templateUrl: "topic.html",
        controller : "topicController",
        resolve : {
          post: ["$route", "posts", function($route, posts) {
            console.log($route.current.params);
            return posts.fetchOne($route.current.params.id);
          }]
        }
      })
      .otherwise({
        redirectTo : "/"
      });
  }
]);

app.factory('posts', ["$http", function($http){

  var object = {
    posts : [],
    
    fetchAll : function(){
        return $http.get("/posts").success(function(data){
            angular.copy(data, object.posts);
        });
    },
    
    fetchOne : function(id) {
        return $http.get("/posts/"+id).then(function(res){  return res.data; });
    },
    
    createPost : function(post) {
        return $http.post("/posts", post).success(function(data){
            object.posts.push(data);
        });
    },
    
    addComment : function(id, comment) {
        return $http.post("/posts/"+id+"/comments",comment);
    }, 
 
    upvote : function(post){
        return $http.put("/posts/" + post._id + "/upvote")
          .success(function(data){
            post.upvotes += 1;
          });
    },

    upvoteComment : function(post, comment) {
      return $http.put("/posts/"+post._id + "/comments/"+comment._id + "/upvote")
        .success(function(data){
          comment.upvotes += 1;
        });
    }
  };

  return object;

}]);

app.controller(
  "topicController", 
  ["$scope", "posts", "post", 
    function($scope, posts, post){
      $scope.text = "";

      $scope.topic = post;
      $scope.comments = post.comments;

      $scope.addComment = function(){
        if (!$scope.text || $scope.text === ''){ return; }
        posts.addComment(post._id, {text: $scope.text, upvotes: 0})
          .success(function(comment) {
            $scope.comments.push(comment);
        });
        $scope.text = '';
      }

      $scope.increaseCommentUpvotes = function(comment){
        posts.upvoteComment(post, comment);
      }
    }
  ]
);

app.controller(
  "homeController", 
  ["$scope", "posts",
    function($scope, posts){
      $scope.text = "";
      $scope.posts = posts.posts; 

      $scope.addPost = function(){
        if (!$scope.text || $scope.text === ''){ return; }
        posts.createPost({text: $scope.text, upvotes: 0, comments: []});
        $scope.text = '';
      }

      $scope.increaseUpvotes = function(post){
        posts.upvote(post);
      }
    }
  ]
);
