/*
 * Copyright 2024 AKABANE Meifai
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function($, $index, $values){
	$.KkleRecord = class{
		constructor(index){
			Object.assign(this, {
				[$index]: index,
				[$values]: []
			});
		}
		*[Symbol.iterator](){
			yield* this[$values];
		}
		static cmp(a, b){
			return b - a[$index];
		}
		get length(){
			return this[$values].length;
		}
		add(value){
			const index = this[$values].indexOf(value);
			if(index < 0){
				this[$values].push(value);
			}
		}
		remove(value){
			const index = this[$values].indexOf(value);
			if(index >= 0){
				this[$values].splice(index, 1);
			}
		}
	};
})(globalThis, Symbol("index"), Symbol("values"));
(function($, $records, $constructor){
	$.KkleStore = class{
		constructor(recordConstructor){
			Object.assign(this, {
				[$records]: [],
				[$constructor]: recordConstructor
			});
		}
		*[Symbol.iterator](){
			for(let record of this[$records]){
				yield* record;
			}
		}
		get length(){
			return this[$records].length;
		}
		search(searchElement){
			let left = 0, right = this[$records].length, mid;
			while(left < right){
				mid = (left + right) >> 1;
				const cmp = this[$constructor].cmp(this[$records][mid], searchElement);
				if(cmp == 0){
					return {found: true, index: mid};
				}
				if(cmp > 0){
					left = mid + 1;
				}else{
					right = mid;
				}
			}
			return {found: false, index: left};
		}
		append(index, value){
			const searchResult = this.search(index);
			if(searchResult.found){
				this[$records][searchResult.index].add(value);
			}else{
				const record = new this[$constructor](index);
				this[$records].splice(searchResult.index, 0, record);
				record.add(value);
			}
		}
		remove(index, value){
			const searchResult = this.search(index);
			if(searchResult.found){
				this[$records][searchResult.index].remove(value);
				if(this[$records][searchResult.index].length <= 0){
					this[$records].splice(searchResult.index, 1);
				}
			}
		}
	};
})(globalThis, Symbol("records"), Symbol("constructor"));
(function($, $action, $filter, $async, $iterable, $content, $parser, $attrSet, $attrMap){
	$.Kkle = class{
		static [$action] = {};
		static [$filter] = {};
		static [$async] = {};
		static [$iterable] = {};
		static [$content] = {};
		static [$parser] = new DOMParser();
		static [$attrSet] = [];
		static [$attrMap] = {};
		static invoke = Symbol("invoke");
		static addAction(hookName, callback, priority){
			if(!(hookName in this[$action])){
				this[$action][hookName] = new KkleStore(KkleRecord);
			}
			this[$action][hookName].append(priority, callback);
		}
		static removeAction(hookName, callback, priority){
			if(!(hookName in this[$action])){
				return;
			}
			this[$action][hookName].remove(priority, callback);
			if(this[$action][hookName].length <= 0){
				delete this[$action][hookName];
			}
		}
		static doAction(hookName, ...args){
			if(!(hookName in this[$action])){
				return;
			}
			for(let callback of this[$action][hookName]){
				if(this.invoke in callback){
					callback[this.invoke](...args);
				}else{
					callback(...args);
				}
			}
		}
		static addFilter(hookName, callback, priority){
			if(!(hookName in this[$filter])){
				this[$filter][hookName] = new KkleStore(KkleRecord);
			}
			this[$filter][hookName].append(priority, callback);
		}
		static removeFilter(hookName, callback, priority){
			if(!(hookName in this[$filter])){
				return;
			}
			this[$filter][hookName].remove(priority, callback);
			if(this[$filter][hookName].length <= 0){
				delete this[$filter][hookName];
			}
		}
		static applyFilters(hookName, value, ...args){
			if(!(hookName in this[$filter])){
				return value;
			}
			let res = value;
			for(let callback of this[$filter][hookName]){
				res = (this.invoke in callback) ? callback[this.invoke](res, ...args) : callback(res, ...args);
			}
			return res;
		}
		static applyFiltersAsync(hookName, value, ...args){
			if(!(hookName in this[$filter])){
				return Promise.resolve(value);
			}
			let res = Promise.resolve(value);
			for(let callback of this[$filter][hookName]){
				const filter = val => (this.invoke in callback) ? callback[this.invoke](val, ...args) : callback(val, ...args);
				res = res.then(filter, filter);
			}
			return res;
		}
		static addAsync(hookName, callback){
			if(!(hookName in this[$async])){
				this[$async][hookName] = new KkleRecord(10);
			}
			this[$async][hookName].add(callback);
		}
		static removeAsync(hookName, callback){
			if(!(hookName in this[$async])){
				return;
			}
			this[$async][hookName].remove(callback);
			if(this[$async][hookName].length <= 0){
				delete this[$async][hookName];
			}
		}
		static all(hookName, ...args){
			if(!(hookName in this[$async])){
				return Promise.resolve(null);
			}
			const asyncList = [];
			for(let callback of this[$async][hookName]){
				asyncList.push((this.invoke in callback) ? callback[this.invoke](...args) : callback(...args));
			}
			return Promise.all(asyncList);
		}
		static allSettled(hookName, ...args){
			if(!(hookName in this[$async])){
				return Promise.resolve(null);
			}
			const asyncList = [];
			for(let callback of this[$async][hookName]){
				asyncList.push((this.invoke in callback) ? callback[this.invoke](...args) : callback(...args));
			}
			return Promise.allSettled(asyncList);
		}
		static any(hookName, ...args){
			if(!(hookName in this[$async])){
				return Promise.resolve(null);
			}
			const asyncList = [];
			for(let callback of this[$async][hookName]){
				asyncList.push((this.invoke in callback) ? callback[this.invoke](...args) : callback(...args));
			}
			return Promise.any(asyncList);
		}
		static race(hookName, ...args){
			if(!(hookName in this[$async])){
				return Promise.resolve(null);
			}
			const asyncList = [];
			for(let callback of this[$async][hookName]){
				asyncList.push((this.invoke in callback) ? callback[this.invoke](...args) : callback(...args));
			}
			return Promise.race(asyncList);
		}
		static addIterable(hookName, callback, priority){
			if(!(hookName in this[$iterable])){
				this[$iterable][hookName] = new KkleStore(KkleRecord);
			}
			this[$iterable][hookName].append(priority, callback);
		}
		static removeIterable(hookName, callback, priority){
			if(!(hookName in this[$iterable])){
				return;
			}
			this[$iterable][hookName].remove(priority, callback);
			if(this[$iterable][hookName].length <= 0){
				delete this[$iterable][hookName];
			}
		}
		static *yieldIterable(hookName){
			if(!(hookName in this[$iterable])){
				return;
			}
			for(let callback of this[$iterable][hookName]){
				if(this.invoke in callback){
					yield* callback[this.invoke];
				}else{
					yield* callback;
				}
			}
		}
		static defineNode(name, html, version = 1, callback = null){
			if((name in this[$content]) && (this[$content][name].version > version)){
				return;
			}
			this[$content][name] = {
				version: version,
				fragment: document.importNode(
					this[$parser]
						.parseFromString(`<template>${html}</template>`, 'text/html')
						.querySelector('template')
						.content,
					true
				),
				callback: callback
			};
		}
		static createNode(name, ...args){
			if(!(name in this[$content])){
				return document.createDocumentFragment();
			}
			const {fragment, callback} = this[$content][name];
			const node = fragment.cloneNode(true);
			if(callback != null){
				if(this.invoke in callback){
					callback[this.invoke](node, ...args);
				}else{
					callback(node, ...args);
				}
			}
			return node;
		}
		static attr(name){
			let i = null;
			if(name in this[$attrMap]){
				i = this[$attrMap][name];
			}else{
				i = this[$attrMap][name] = this[$attrSet].length;
				this[$attrSet].push(name);
			}
			return `data-kkle="${i}"`;
		}
		static adjustElement(element, value, input = false){
			if(typeof value == "string"){
				if(input){
					element.value = value;
				}else{
					element.textContent = value;
				}
			}else if(value instanceof Node){
				if(!input){
					element.innerHTML = "";
					element.appendChild(value);
				}
			}else if(Array.isArray(value)){
				if(!input){
					element.innerHTML = "";
					element.append(...value);
				}
			}else if(typeof value == "object"){
				for(let key in value){
					if(key == "value"){
						this.adjustElement(element, value[key], input);
					}else if(key.startsWith("@")){
						element.setAttribute(key.slice(1), value[key]);
					}else if(key.startsWith("+")){
						const types = key.slice(1).split(" ");
						for(let type of types){
							element.addEventListener(listener, value[key]);
						}
					}else if(key.startsWith("-")){
						const types = key.slice(1).split(" ");
						for(let type of types){
							element.removeEventListener(listener, value[key]);
						}
					}else{
						element[key] = value[key];
					}
				}
			}
		}
		static assignElements(node, values){
			const input = new Set([HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement]);
			return Object.fromEntries(Array.from(node.querySelectorAll('[data-kkle]'), element => {
				const i = Number(element.getAttribute("data-kkle"));
				const name = this[$attrSet][i];
				element.removeAttribute("data-kkle");
				if(name in values){
					const value = values[name];
					this.adjustElement(element, value, input.has(element.constructor));
				}
				return [name, element];
			}));
		}
	};
})(globalThis, Symbol("action"), Symbol("filter"), Symbol("async"), Symbol("iterable"), Symbol("content"), Symbol("parser"), Symbol("attrSet"), Symbol("attrMap"));
