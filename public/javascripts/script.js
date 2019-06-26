var contextURL = '';
var configFetched = false;
var tenantId = 0;

//get tenantId from qs
function getQueryStrings() {
  var assoc = {};
  var decode = function (s) {
    return decodeURIComponent(s.replace(/\+/g, " "));
  };
  var queryString = location.search.substring(1);
  var keyValues = queryString.split("&");

  for (var i in keyValues) {
    var key = keyValues[i].split("=");
    if (key.length > 1) {
      assoc[decode(key[0])] = decode(key[1]);
    }
  }
  return assoc;
}

//get site list
function onLoadData() {
  var sites;
  var selectedSiteId;
  console.log("tenantId", tenantId);
  $.ajax({
    url: '/api/getSitesForTenant/?tenantId=' + tenantId,
    type: "GET",
    crossDomain: true,
    success: function (response) {
      var count = 0;
      var selectedSiteId;
      var tenantSites = JSON.parse(response);
      for (var i in tenantSites) {
        sites += '<option value="' + tenantSites[i].id + '">' + tenantSites[i].name + "</option>";
        if (count == 0) {
          selectedSiteId = tenantSites[i].id;
        }
        count++;
      }
      $("#siteList").append(sites);
      $(".spinner").hide();
      getConfigurations(selectedSiteId);
    },
    error: function (response) {
      $(".spinner").hide();
    },
    fail: function (response) {
      $(".spinner").hide();
    }
  });
  $(".spinner").hide();
}

function displayMessage(alertType, message) {
  $('.heading-wrapper:first').after('<div class="alert ' + alertType + '"role="alert">' + message + '</div>');
  setTimeout(function () {
    $('.heading-wrapper:first').next('.alert').fadeOut(500, function () {
      $(this).remove();
    });
  }, 3000);
}

//get existing config data
function getConfigurations(siteId) {
  $(".spinner").show();
  try {
    $.ajax({
      type: "GET",
      url: '/api/getTPEntity?tenantId= '+ tenantId + '&siteId=' + siteId,
      success: function (response) {
        console.log(response);
        if (response.items && response.items.length > 0) {
          configFetched = true;
          $.each(response.items[0], function (key, value) {
            if (key != "id") {
              $("#" + key).val(value);
            }
          });
        } else {
          displayMessage('alert-danger', 'We are not able to fetch any information, please enter valid configuration... ');
          $("#configurationForm input").val('');
          configFetched = false;
        }
        $(".spinner").hide();
      },
      error: function (response) {
        $(".spinner").hide();
      },
      fail: function (response) {
        $(".spinner").hide();
      }
    });
  } catch (error) {
    console.log(error);
  }
}
//form validation
function ValidateForm() {
  $("span.error_msg").html("");
  var success = true;
  $("#configurationForm input").each(function () {
    if($(this).val() == "") {
      $(this).next().html('<font color="red">This needs to be filled!</font>');
      success = false;
    } else {
      $(this).next().html("");
    }
  });
  return success;
}
$(document).ready(function () {
  var qs = getQueryStrings();
      tenantId = qs.tenantId;

  //on configuration submit click
  var requestType = {url: '', type: ''};

  $("#informationSubmit").on("click", function () {
    if (ValidateForm()) {
      $(".spinner").show();
      var formData = {
        apiKey: $("#apiKey").val(),
        apiUsername: $("#apiUsername").val(),
        secretKey: $('#secretKey').val(),
        apiPassword: $("#apiPassword").val(),
        templateID: $("#templateID").val(),
        buisnessID: $("#buisnessID").val(),
        redirectionURL: $("#redirectionURL").val()
      };
      var siteId = $("#siteList").val();
      if (configFetched) {
        requestType.url = '/api/updateTPEntity?tenantId= '+ tenantId + '&siteId=' + siteId;
        requestType.type = 'PUT';
      } else {
        requestType.url = '/api/createTPEntity?tenantId= '+ tenantId + '&siteId=' + siteId;
        requestType.type = 'POST';
      }
      $.ajax({
        url: requestType.url,
        contentType: "application/json; charset=utf-8",
        type: requestType.type,
        data: JSON.stringify(formData),
        crossDomain: true,
        success: function (response) {
          $(".spinner").hide();
          displayMessage('alert-success', 'Configuration Saved Successfully!!');
        },
        error: function (response) {
          $(".spinner").hide();
          displayMessage('alert-warning', 'Something went wrong, please enter valid information!!!');
        }
      });
    }
  });

  //on siteList change
  $("#siteList").on("change", function() {
    $(".spinner").show();
    var selectedSiteId = $(this).val();
    getConfigurations(selectedSiteId);
  });
  
  onLoadData();
});