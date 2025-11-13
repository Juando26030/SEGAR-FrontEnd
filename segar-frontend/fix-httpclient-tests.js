// Script para agregar provideHttpClient a tests que lo necesiten
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('child_process');

function needsHttpClient(specFilePath) {
  const componentDir = path.dirname(specFilePath);
  const componentName = path.basename(specFilePath, '.spec.ts');
  const tsPath = path.join(componentDir, componentName + '.ts');
  
  if (!fs.existsSync(tsPath)) {
    return false;
  }
  
  const tsContent = fs.readFileSync(tsPath, 'utf8');
  
  // Verificar si el componente inyecta servicios que probablemente usen HttpClient
  const servicePattern = /(Service|HttpClient)/;
  const constructorMatch = tsContent.match(/constructor\(([\s\S]*?)\)/);
  
  if (constructorMatch && servicePattern.test(constructorMatch[1])) {
    return true;
  }
  
  return false;
}

function fixHttpClientTest(specFilePath) {
  let specContent = fs.readFileSync(specFilePath, 'utf8');
  
  // Verificar si ya tiene provideHttpClient
  if (specContent.includes('provideHttpClient')) {
    return { fixed: false, reason: 'Ya tiene provideHttpClient' };
  }
  
  // Verificar si necesita HttpClient
  if (!needsHttpClient(specFilePath)) {
    return { fixed: false, reason: 'No parece necesitar HttpClient' };
  }
  
  // Agregar imports si no existen
  if (!specContent.includes('provideHttpClient')) {
    const importLine = `import { provideHttpClient } from '@angular/common/http';\nimport { provideHttpClientTesting } from '@angular/common/http/testing';`;
    
    // Buscar el último import de Angular
    const lastAngularImport = specContent.lastIndexOf("from '@angular/");
    if (lastAngularImport !== -1) {
      const endOfLine = specContent.indexOf('\n', lastAngularImport);
      specContent = specContent.slice(0, endOfLine + 1) + importLine + '\n' + specContent.slice(endOfLine + 1);
    }
  }
  
  // Agregar provideRouter si no existe
  if (!specContent.includes('provideRouter')) {
    const routerImport = `import { provideRouter } from '@angular/router';`;
    const lastAngularImport = specContent.lastIndexOf("from '@angular/");
    if (lastAngularImport !== -1) {
      const endOfLine = specContent.indexOf('\n', lastAngularImport);
      specContent = specContent.slice(0, endOfLine + 1) + routerImport + '\n' + specContent.slice(endOfLine + 1);
    }
  }
  
  // Agregar providers al TestBed
  if (specContent.includes('providers:')) {
    // Ya tiene providers, agregar a la lista existente
    specContent = specContent.replace(
      /providers:\s*\[/,
      `providers: [\n        provideHttpClient(),\n        provideHttpClientTesting(),\n        provideRouter([]),`
    );
  } else {
    // No tiene providers, agregarlos
    specContent = specContent.replace(
      /imports:\s*\[([^\]]+)\]/,
      `imports: [$1],\n      providers: [\n        provideHttpClient(),\n        provideHttpClientTesting(),\n        provideRouter([])\n      ]`
    );
  }
  
  fs.writeFileSync(specFilePath, specContent, 'utf8');
  
  return {
    fixed: true,
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
    } else if (file.endsWith('.spec.ts') && !file.includes('email.service')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

console.log('🔍 Buscando tests que necesiten HttpClient...\n');

const srcDir = path.join(__dirname, 'src');
const specFiles = findSpecFiles(srcDir);

let fixedCount = 0;
let skippedCount = 0;

for (const specFile of specFiles) {
  const result = fixHttpClientTest(specFile);
  
  if (result.fixed) {
    console.log(`✅ ${path.relative(__dirname, specFile)}`);
    fixedCount++;
  } else {
    skippedCount++;
  }
}

console.log(`\n📊 Resumen:`);
console.log(`   ✅ Corregidos: ${fixedCount}`);
console.log(`   ⏭️  Omitidos: ${skippedCount}`);
