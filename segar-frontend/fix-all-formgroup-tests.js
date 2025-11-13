// Script para detectar y agregar automáticamente los FormControls correctos
const fs = require('node:fs');
const path = require('node:path');

function extractFormControlNames(htmlPath) {
  if (!fs.existsSync(htmlPath)) {
    return [];
  }
  
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const regex = /formControlName="([^"]+)"/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(htmlContent)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }
  
  return matches;
}

function fixTestFile(specFilePath) {
  const componentDir = path.dirname(specFilePath);
  const componentName = path.basename(specFilePath, '.spec.ts');
  const htmlPath = path.join(componentDir, componentName + '.html');
  const tsPath = path.join(componentDir, componentName + '.ts');
  
  // Verificar si el componente tiene un @Input form
  if (!fs.existsSync(tsPath)) {
    return { fixed: false, reason: 'No se encontró el archivo .ts' };
  }
  
  const tsContent = fs.readFileSync(tsPath, 'utf8');
  if (!tsContent.includes('@Input() form!: FormGroup') && !tsContent.includes('@Input() form: FormGroup')) {
    return { fixed: false, reason: 'No usa @Input() form: FormGroup' };
  }
  
  // Extraer los formControlNames del HTML
  const formControls = extractFormControlNames(htmlPath);
  if (formControls.length === 0) {
    return { fixed: false, reason: 'No se encontraron formControlName en el HTML' };
  }
  
  // Leer el archivo spec
  let specContent = fs.readFileSync(specFilePath, 'utf8');
  
  // Verificar si ya tiene FormGroup importado
  if (!specContent.includes('FormGroup, FormControl')) {
    // Agregar imports
    specContent = specContent.replace(
      /import { ComponentFixture, TestBed } from '@angular\/core\/testing';/,
      `import { ComponentFixture, TestBed } from '@angular/core/testing';\nimport { FormGroup, FormControl } from '@angular/forms';`
    );
  }
  
  // Crear los controles del formulario
  const formControlsCode = formControls
    .map(name => `      ${name}: new FormControl('')`)
    .join(',\n');
  
  const formGroupMock = `    
    // Mock del FormGroup que el componente espera como @Input
    component.form = new FormGroup({
${formControlsCode}
    });
    `;
  
  // Si ya tiene un component.form, reemplazarlo
  if (specContent.includes('component.form = new FormGroup')) {
    specContent = specContent.replace(
      /component\.form = new FormGroup\({[\s\S]*?\}\);/,
      `component.form = new FormGroup({\n${formControlsCode}\n    });`
    );
  } else {
    // Si no, agregarlo antes de detectChanges
    specContent = specContent.replace(
      /(\s+)fixture\.detectChanges\(\);/,
      `${formGroupMock}\n$1fixture.detectChanges();`
    );
  }
  
  fs.writeFileSync(specFilePath, specContent, 'utf8');
  
  return {
    fixed: true,
    controls: formControls,
    path: specFilePath
  };
}

// Buscar todos los archivos spec.ts
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

console.log('🔍 Buscando tests con problemas de FormGroup...\n');

const srcDir = path.join(__dirname, 'src');
const specFiles = findSpecFiles(srcDir);

let fixedCount = 0;
let skippedCount = 0;

for (const specFile of specFiles) {
  const result = fixTestFile(specFile);
  
  if (result.fixed) {
    console.log(`✅ ${path.relative(__dirname, specFile)}`);
    console.log(`   Controles: ${result.controls.join(', ')}\n`);
    fixedCount++;
  } else {
    skippedCount++;
  }
}

console.log(`\n📊 Resumen:`);
console.log(`   ✅ Corregidos: ${fixedCount}`);
console.log(`   ⏭️  Omitidos: ${skippedCount}`);
console.log(`   📁 Total archivos: ${specFiles.length}`);
