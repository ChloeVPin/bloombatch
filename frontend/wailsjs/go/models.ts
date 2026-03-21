export namespace main {
	
	export class FileInfo {
	    fullPath: string;
	    dir: string;
	    name: string;
	    ext: string;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new FileInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fullPath = source["fullPath"];
	        this.dir = source["dir"];
	        this.name = source["name"];
	        this.ext = source["ext"];
	        this.size = source["size"];
	    }
	}
	export class PreviewResult {
	    originalName: string;
	    newName: string;
	    fullPath: string;
	    dir: string;
	    hasConflict: boolean;
	    conflictNote: string;
	
	    static createFrom(source: any = {}) {
	        return new PreviewResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.originalName = source["originalName"];
	        this.newName = source["newName"];
	        this.fullPath = source["fullPath"];
	        this.dir = source["dir"];
	        this.hasConflict = source["hasConflict"];
	        this.conflictNote = source["conflictNote"];
	    }
	}
	export class RenameResult {
	    success: boolean;
	    originalPath: string;
	    newPath: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new RenameResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.originalPath = source["originalPath"];
	        this.newPath = source["newPath"];
	        this.error = source["error"];
	    }
	}
	export class RenameRule {
	    type: string;
	    prefix: string;
	    suffix: string;
	    searchText: string;
	    replaceText: string;
	    startNum: number;
	    padding: number;
	    caseMode: string;
	
	    static createFrom(source: any = {}) {
	        return new RenameRule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.prefix = source["prefix"];
	        this.suffix = source["suffix"];
	        this.searchText = source["searchText"];
	        this.replaceText = source["replaceText"];
	        this.startNum = source["startNum"];
	        this.padding = source["padding"];
	        this.caseMode = source["caseMode"];
	    }
	}

}

