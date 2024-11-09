Kkle.defineNode("list", `
<table border="1">
	<thead>
		<tr>
			<th>Column1</th>
			<th>Column2</th>
			<th>Column3</th>
			<th>Column4</th>
			<th>Column5</th>
		</tr>
	</thead>
	<tbody data-kkle-element="list"></tbody>
</table>
<div data-kkle-element="ctrl">
	<button type="button" data-kkle-element="append-btn">Append</button>
</div>
`, 1, function(node, dataList){
	const elements = Object.fromEntries(
		Array.from(
			node.querySelectorAll('[data-kkle-element]'),
			function(element){
				return [element.getAttribute("data-kkle-element"), element];
			}
		)
	);
	for(let item of Kkle.yieldIterable("list-ctrl-item")){
		elements.ctrl.appendChild(item);
	}
	for(let data of dataList){
		elements.list.appendChild(Kkle.applyFilters("generate-list-item", null, data));
	}
	elements["append-btn"].addEventListener("click", () => {
		const data = Kkle.applyFilters("generate-list-data", {});
		elements.list.appendChild(Kkle.applyFilters("generate-list-item", null, data));
	});
});
Kkle.defineNode("list-item-default", `
<tr>
	<td>Data1</td>
	<td>Data2</td>
	<td>Data3</td>
	<td>Data4</td>
	<td>Data5</td>
</tr>
`);
Kkle.addAction("ready", function(){
	document.body.appendChild(Kkle.createNode("list", []));
}, 10);
Kkle.addFilter("generate-list-item", function(node, data){
	if(node != null){
		return node;
	}
	return Kkle.createNode("list-item-default");
}, 1000);
