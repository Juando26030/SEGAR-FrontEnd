// Script para convertir tests de Jasmine a Jest
const fs = require('node:fs');
const path = require('node:path');

function convertJasmineToJest(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Convertir declaraciones de variables con tipo después de describe/it
    // Ejemplo: let service: ServiceType; -> let service = null as any;
    // Babel no soporta anotaciones de tipo sin inicializador
    const letTypeAnnotationRegex = /(\s+let\s+\w+):\s*([^;=]+);/g;
    if (letTypeAnnotationRegex.test(content)) {
        content = content.replaceAll(letTypeAnnotationRegex, '$1 = null as any;');
        console.log(`Fixed let type annotations in ${filePath}`);
        modified = true;
    }
    
    // Convertir declaraciones const con tipo a sin tipo
    // Ejemplo: const compiled: HTMLElement = value; -> const compiled = value as HTMLElement;
    const constTypeAnnotationRegex = /(\s+const\s+\w+):\s*([^=]+)\s*=\s*([^;]+);/g;
    if (constTypeAnnotationRegex.test(content)) {
        content = content.replaceAll(constTypeAnnotationRegex, '$1 = $3 as $2;');
        console.log(`Fixed const type annotations in ${filePath}`);
        modified = true;
    }

    // Convertir .and.returnValue() a .mockReturnValue()
    if (content.includes('.and.returnValue(')) {
        content = content.replaceAll('.and.returnValue(', '.mockReturnValue(');
        console.log(`Converted .and.returnValue() to .mockReturnValue() in ${filePath}`);
        modified = true;
    }

    // Convertir .and.callFake() a .mockImplementation()
    if (content.includes('.and.callFake(')) {
        content = content.replaceAll('.and.callFake(', '.mockImplementation(');
        console.log(`Converted .and.callFake() to .mockImplementation() in ${filePath}`);
        modified = true;
    }

    // Convertir expectAsync().toBeResolved() a expect(promise).resolves
    content = content.replaceAll(/await expectAsync\(([^)]+)\)\.toBeResolved\(\);/g, 
        'await expect($1).resolves.toBeDefined();');
    
    // Convertir expectAsync().toBeRejected() a expect(promise).rejects
    content = content.replaceAll(/await expectAsync\(([^)]+)\)\.toBeRejected\(\);/g, 
        'await expect($1).rejects.toThrow();');

    // Convertir jasmine.SpyObj a jest.Mocked
    if (content.includes('jasmine.SpyObj<')) {
        content = content.replaceAll('jasmine.SpyObj<', 'jest.Mocked<');
        console.log(`Converted jasmine.SpyObj to jest.Mocked in ${filePath}`);
        modified = true;
    }

    // Convertir jasmine.createSpyObj
    if (content.includes('jasmine.createSpyObj')) {
        console.log(`⚠️  Manual conversion needed for jasmine.createSpyObj in ${filePath}`);
        // No lo convertimos automáticamente porque es más complejo
    }

    // Convertir HttpClientTestingModule imports
    if (content.includes('HttpClientTestingModule')) {
        content = content.replaceAll(
            /import \{ HttpClientTestingModule, HttpTestingController \} from '@angular\/common\/http\/testing';/g,
            "import { provideHttpClient } from '@angular/common/http';\nimport { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';"
        );
        content = content.replaceAll(/imports:\s*\[([^\]]*?)HttpClientTestingModule([^\]]*?)\]/g, 
            'providers: [$1provideHttpClient(), provideHttpClientTesting()$2]');
        console.log(`Converted HttpClientTestingModule in ${filePath}`);
        modified = true;
    }

    // Convertir type assertions "as Type" a type annotations ": Type"
    // Esto es para casos como: const compiled = fixture.nativeElement as HTMLElement;
    // Lo convertimos a: const compiled: HTMLElement = fixture.nativeElement;
    const asTypeRegex = /const\s+(\w+)\s*=\s*([^;]+)\s+as\s+([^;]+);/g;
    if (asTypeRegex.test(content)) {
        content = content.replace(/const\s+(\w+)\s*=\s*([^;]+)\s+as\s+([^;]+);/g, 
            'const $1: $3 = $2;');
        console.log(`Converted type assertions in ${filePath}`);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
    }

    return modified;
}

// Buscar todos los archivos .spec.ts
function findSpecFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !filePath.includes('node_modules')) {
            findSpecFiles(filePath, fileList);
        } else if (file.endsWith('.spec.ts')) {
            fileList.push(filePath);
        }
    }
    
    return fileList;
}

// Ejecutar conversión
const srcDir = path.join(__dirname, 'src');
const specFiles = findSpecFiles(srcDir);

console.log(`Found ${specFiles.length} spec files`);
console.log('Converting...\n');

let convertedCount = 0;
for (const file of specFiles) {
    if (convertJasmineToJest(file)) {
        convertedCount++;
    }
}

console.log(`\n✅ Converted ${convertedCount} files`);
console.log(`⚠️  Manual review recommended for complex spy objects`);
