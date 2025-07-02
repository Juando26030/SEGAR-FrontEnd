interface PlantillaDocumentoDTO {
  idPlantilla: string;
  nombreDocumento: string;
  descripcion: string;
  campos: CampoPlantillaDTO[];
  categoria: CategoriaDocumento;
}
