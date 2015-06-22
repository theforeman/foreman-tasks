//= require_tree .
$(document).ready(function(){
  var taskCountUpdater = (function(){
    var counts = function(data){
      var result_count = {};
      $.each(data, function(idx, result){
        result_count[result.result] = typeof result_count[result.result] === 'undefined' ? 0 : result_count[result.result];
        result_count[result.result] = result_count[result.result] + parseInt(result.count);
      });
      return result_count;
    }

    var updateSubMenuItems = function(data){
      $.each(data, function(idx, result){
        var id = result.state + '_' + result.result;
        var elems = $("." + id);
        elems.text(result.state + '/' + result.result + ":" + result.count);
        if(result.count === "0"){
          elems.hide();
        }else{
          elems.show();
        }
       });
    }

    var updateMainMenu = function(data){
      var result_count = counts(data);
      for (var state in result_count) {
        var elems = $("." + state + ".task-count");
        elems.text(result_count[state]);
        if(result_count[state] === 0){
          elems.closest('.task-results').hide();
        }else{
          elems.closest('task-results').show();
        }
      }
    }

    var updateElements = function(data){
      updateSubMenuItems(data);
      updateMainMenu(data);

    };
    return {counts: counts, updateElements: updateElements};
  })();

  (function(){
    var updateStatus = function(){
      $.ajax({
        url: '/foreman_tasks/api/tasks/summary.json',
        success: function(data, status) {
          taskCountUpdater.updateElements(data);
        }
      });
    };

    setInterval(updateStatus, 1000);
  })();
});
