function Photo(id, token){
	this.photo_id = id;
	this.token = token;
}

function commitUpload(json) {
	json = json["photos"];
	var request = [];
	
	$.each(json, function(id, tokenJSON) {
		token = tokenJSON["token"];
		var photo = new Photo(id, token);
		
		request.push(photo);
	});
	
	requestJSON = JSON.stringify(request);
	
	FAPI.Client.call({"method":"photosV2.commit", "photos":requestJSON}, function(method, data, result) {
		var success = true;
		
		$.each(data["photos"], function(index, photoResult) {
			if (photoResult["status"] != "SUCCESS") {
				success = false;
			}
		});
		
		if (success) {
			alert('Success upload');
		} else {
			alert('Upload failed');
		}
		
		$('#content').empty();
	});
}

function drawForm(upload_url, quantity) {
	var form = $('<form id="form" method="POST" enctype="multipart/form-data" action="'+upload_url+'"></form>');
	for(keep = 0; keep < quantity; keep++) {
		var photo = $('<input type="file" name="pic' + keep + '" accept="image/*" />');
		$(form).append(photo);
	}
	
	var submitButton = $('<input type="submit" />');
	$(form).append(submitButton);
	
	$('#content').empty();
	$('#content').append(form);
	
	$('#form').on('submit',(function(e) {
        e.preventDefault();
		var formData = new FormData($('#form')[0]);
		
        $.ajax ({
            type :'POST',
            url : $(this).attr('action'),
            data : formData,
			contentType : false,
			processData : false,
            cache : false,
            success : function(response) {
				commitUpload(JSON.parse(response));
            }
        });
    }));
}

function loadForm(quantity) {
	FAPI.Client.call({"method":"photosV2.getUploadUrl", "count" : quantity}, function(method, result, data) {
		drawForm(result["upload_url"], quantity);
	});
}

var rParams = FAPI.Util.getRequestParameters();
FAPI.init(rParams["api_server"], rParams["apiconnection"],
          function() { },
          function(error) { }
);