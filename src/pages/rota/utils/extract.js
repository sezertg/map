export function extractSearchListWithCoordinates(data) {
  const list = [];

  data.forEach(province => {
    const provinceName = province.Province;
    const provinceCoords = province.Coordinates;

    // İl
    list.push({
      name: provinceName,
      coordinates: provinceCoords
    });

    province.Districts.forEach(district => {
      const districtName = district.District;
      const districtCoords = district.Coordinates;

      // İlçe
      list.push({
        name: `${provinceName}, ${districtName}`,
        coordinates: districtCoords
      });

      /*district.Towns.forEach(town => {
        const townName = town.Town;
        // İlçe koordinatları yoksa varsa town koordinat eklenebilir (seninki yok galiba)
        // Town koordinat yoksa boş string bırakabiliriz
        const townCoords = town.Coordinates || '';

        // Belde (town)
        list.push({
          name: `${townName}, ${districtName}, ${provinceName}`,
          coordinates: townCoords || districtCoords
        });

        town.Neighbourhoods.forEach(neighbourhood => {
          // Mahallelerde koordinat yok, ilçenin koordinatını kullanıyoruz
          list.push({
            name: `${neighbourhood}, ${townName}, ${districtName}, ${provinceName}`,
            coordinates: districtCoords
          });
        });
      });*/
    });
  });

  return list;
}