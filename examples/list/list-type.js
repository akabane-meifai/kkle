Kkle.defineNode("list-ctrl-type", `
<select class="list-ctrl-type">
	<option value="1">default</option>
	<option value="2">info</option>
	<option value="3">warning</option>
	<option value="4">danger</option>
</select>
`);
Kkle.addIterable("list-ctrl-item", {
	*[Symbol.iterator](){
		yield Kkle.createNode("list-ctrl-type");
	}
}, 10);
Kkle.addFilter("generate-list-data", function(data){
	data.type = document.querySelector('.list-ctrl-type').value;
	return data;
}, 10);
Kkle.addFilter("generate-list-item", function(node, data){
	if(node != null){
		return node;
	}
	const item = Kkle.createNode("list-item-default");
	const row = item.querySelector("tr");
	if(data.type == "2"){
		row.style.background = "#25cff2";
	}else if(data.type == "3"){
		row.style.background = "#ffca2c";
	}else if(data.type == "4"){
		row.style.background = "#bb2d3b";
	}
	return item;
}, 10);
