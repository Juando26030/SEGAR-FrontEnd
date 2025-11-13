// Script para agregar mocks de FormGroup en los tests
const fs = require('node:fs');
const path = require('node:path');

const testsToFix = [
  {
    path: 'src/app/pages/nuevo-usuario/registro-info-cuenta/registro-info-cuenta.component.spec.ts',
    formControls: `username: new FormControl(''),
      password: new FormControl(''),
      confirmPassword: new FormControl('')`
  },
  {
    path: 'src/app/pages/nuevo-usuario/registro-info-personal/registro-info-personal.component.spec.ts',
    formControls: `nombre: new FormControl(''),
      apellido: new FormControl(''),
      tipoDocumento: new FormControl(''),
      numeroDocumento: new FormControl('')`
  },
  {
    path: 'src/app/tramites/registro/registro-paso-uno/registro-paso-uno.component.spec.ts',
    formControls: `campo1: new FormControl(''),
      campo2: new FormControl('')`
  },
  {
    path: 'src/app/tramites/registro/registro-paso-dos/registro-paso-dos.component.spec.ts',
    formControls: `campo1: new FormControl(''),
      campo2: new FormControl('')`
  },
  {
    path: 'src/app/tramites/registro/registro-paso-cuatro/registro-paso-cuatro.component.spec.ts',
    formControls: `campo1: new FormControl(''),
      campo2: new FormControl('')`
  },
  {
    path: 'src/app/tramites/registro/registro-paso-cinco/registro-paso-cinco.component.spec.ts',
    formControls: `campo1: new FormControl(''),
      campo2: new FormControl('')`
  }
];

function fixTest(testInfo) {
  const fullPath = path.join(__dirname, testInfo.path);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ No encontrado: ${fullPath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Verificar si ya tiene FormGroup importado
  if (content.includes('FormGroup, FormControl')) {
    console.log(`⏭️  Ya corregido: ${testInfo.path}`);
    return false;
  }
  
  // Agregar imports de FormGroup y FormControl
  content = content.replace(
    /import { ComponentFixture, TestBed } from '@angular\/core\/testing';/,
    `import { ComponentFixture, TestBed } from '@angular/core/testing';\nimport { FormGroup, FormControl } from '@angular/forms';`
  );
  
  // Agregar el mock del FormGroup antes de fixture.detectChanges()
  const formGroupMock = `    
    // Mock del FormGroup que el componente espera como @Input
    component.form = new FormGroup({
      ${testInfo.formControls}
    });
    `;
  
  content = content.replace(
    /fixture\.detectChanges\(\);/,
    `${formGroupMock}
    fixture.detectChanges();`
  );
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Corregido: ${testInfo.path}`);
  return true;
}

console.log('Corrigiendo tests con problemas de FormGroup...\n');

let fixedCount = 0;
for (const testInfo of testsToFix) {
  if (fixTest(testInfo)) {
    fixedCount++;
  }
}

console.log(`\n✅ Total corregidos: ${fixedCount} archivos`);
