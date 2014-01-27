//класс для подтверждения загрузки фотографий
//class for photos commit
function Photo(id, token){
	this.photo_id = id;
	this.token = token;
}

//функция для подтверждения загрузки фотографий
//fucntion for photos commit
function commitUpload(json) {
	json = json["photos"];
	var request = [];
	
	//включаем все фотографии в запрос
	//include all photos into request
	$.each(json, function(id, tokenJSON) {
		token = tokenJSON["token"];
		var photo = new Photo(id, token);
		
		request.push(photo);
	});
	
	requestJSON = JSON.stringify(request);
	
	//вызов метода API
	//API method call
	FAPI.Client.call({"method":"photosV2.commit", "photos":requestJSON}, function(method, data, result) {
		var success = true;
		
		//проверяем, что все удачно загрузились
		//check that all right
		$.each(data["photos"], function(index, photoResult) {
			if (photoResult["status"] != "SUCCESS") {
				success = false;
			}
		});
		
		//выдаем оповещение о загрузке
		//give alert about loading
		if (success) {
			alert('Success upload');
		} else {
			alert('Upload failed');
		}
		
		$('#content').empty();
	});
}

//функция отрисовки и отправки формы
//function for drawing and posting form
function drawForm(upload_url, quantity) {
	//рисуем форму с заданным количеством загрузок
	//draw form with specified loading quantity
	var form = $('<form id="form" method="POST" enctype="multipart/form-data" action="'+upload_url+'"></form>');
	for(keep = 0; keep < quantity; keep++) {
		var photo = $('<input type="file" name="pic' + keep + '" accept="image/*" />');
		$(form).append(photo);
	}
	
	var submitButton = $('<input type="submit" />');
	$(form).append(submitButton);
	
	$('#content').empty();
	$('#content').append(form);
	
	//выполняем загрузку фотографий на сервер
	//run loading photos on server
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

//функция получения url для загрузки
//function for getting upload url
function loadForm(quantity) {
	FAPI.Client.call({"method":"photosV2.getUploadUrl", "count" : quantity}, function(method, result, data) {
		drawForm(result["upload_url"], quantity);
	});
}

//инициализация API
//API initialization
var rParams = FAPI.Util.getRequestParameters();
FAPI.init(rParams["api_server"], rParams["apiconnection"],
          function() { },
          function(error) { }
);