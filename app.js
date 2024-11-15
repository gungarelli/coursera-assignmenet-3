(function () {
  'use strict';

  angular.module('NarrowItDownApp', [])
    .controller('NarrowItDownController', NarrowItDownController)
    .service('MenuSearchService', MenuSearchService)
    .directive('foundItems', FoundItemsDirective);

  NarrowItDownController.$inject = ['MenuSearchService'];
  function NarrowItDownController(MenuSearchService) {
    var ctrl = this;
    ctrl.searchTerm = "";
    ctrl.found = [];

    ctrl.narrowItDown = function () {
      console.log("Narrow It Down button clicked");  // Debugging line
      if (ctrl.searchTerm.trim() !== "") {
        MenuSearchService.getMatchedMenuItems(ctrl.searchTerm)
          .then(function (foundItems) {
            console.log("Found items:", foundItems); // Debugging line
            ctrl.found = foundItems;
          })
          .catch(function (error) {
            console.error("Error occurred in narrowItDown:", error); // Debugging line
            ctrl.found = [];
          });
      } else {
        ctrl.found = [];
      }
    };

    ctrl.removeItem = function (index) {
      console.log("Removing item at index:", index); // Debugging line
      ctrl.found.splice(index, 1);
    };
  }

  MenuSearchService.$inject = ['$http'];
  function MenuSearchService($http) {
    var service = this;

    service.getMatchedMenuItems = function (searchTerm) {
      return $http.get('https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json')
        .then(function (result) {
          console.log("HTTP request succeeded:", result); // Debugging line

          var foundItems = [];
          var categories = result.data;

          // Loop through each category
          for (var categoryKey in categories) {
            if (categories.hasOwnProperty(categoryKey)) {
              var category = categories[categoryKey];
              var items = category.menu_items;

              console.log("Received items for category", categoryKey, ":", items.length); // Debugging line

              // Loop through each item in the category
              for (var i = 0; i < items.length; i++) {
                var description = items[i].description;
                if (description.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
                  foundItems.push(items[i]);
                }
              }
            }
          }

          return foundItems;
        })
        .catch(function (error) {
          console.error("HTTP request failed:", error); // Debugging line
          throw error;
        });
    };
  }

  function FoundItemsDirective() {
    var ddo = {
      templateUrl: 'foundItems.html',
      scope: {
        found: '<',
        onRemove: '&'
      },
      controller: FoundItemsDirectiveController,
      controllerAs: 'list',
      bindToController: true
    };

    return ddo;
  }

  function FoundItemsDirectiveController() {
    var list = this;
  }
})();
