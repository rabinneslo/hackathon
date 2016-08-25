#!python
import csv, io, json, requests

def main():

    besturen = list(parseBevoegdGezag(readCSV('bevoegdgezag.csv')))
    print(besturen[0])
    scholen = list(parseScholen(readCSV('basisscholen.csv')))
    print(scholen[0])
    for bestuur in besturen:
        bestuur['scholen'] = [school for school in scholen if school['bg_nr'] == bestuur['bg_nr']]
    
    with open('dataschools.json', 'w', encoding='latin-1') as f:
        json_string = json.dumps(besturen, ensure_ascii=False)
        f.write(json_string);
        #print bestuur['naam'], len(bestuur['scholen'])

def parseBevoegdGezag(rows):
    for row in rows:
        yield mapRowBevoegdGezag(row)

def parseScholen(rows):
    personeel = list(parsePersoneel(readCSV('personeel_basisscholen.csv')))
    for row in rows:
        yield mapRowSchool(row, personeel)

def parsePersoneel(rows):
    for row in rows:
        yield mapRowPersoneel(row)

def mapRowBevoegdGezag(row):
    result = {}
    result['bg_nr'] = row[0]
    result['naam'] = row[1]

    result['adres'] = {}   
    result['adres']['straat'] = row[2]
    result['adres']['huisnummer'] = row[3]
    result['adres']['postcode'] = row[4]
    result['adres']['plaats'] = row[5]
    result['adres']['gemeente_nr'] = row[6]
    result['adres']['gemeente'] = row[7]

    result['type'] = row[8]
   
    result['contact'] = {}
    result['contact']['telefoon'] = row[9]
    result['contact']['website'] = row[10]

    result['soorten'] = row[16].split(' + ')
    result['scholen'] = []
    result['locatie'] = {}
    r = requests.get('http://boskopu.com:9200/koiri/_search?q=url:'+result['adres']['postcode']+'-'+result['adres']['straat']+'-'+result['adres']['huisnummer'])
    result['locatie']['lat'] = 0
    result['locatie']['lon'] = 0
    if r.status_code == 200:
        data = r.json()
        if data['hits'] and data['hits']['total'] > 0:
            source = data['hits']['hits'][0]['_source']
            if source and source['position']:
                result['locatie']['lat'] = source['position']['lat']
                result['locatie']['lon'] = source['position']['lon']      
    return result

def mapRowSchool(row, personeel):

    result = {}
   
    result['bg_nr'] = row[0]
    result['brin_nr'] = row[1]
    result['naam'] = row[2]
   
    result['adres'] = {}   
    result['adres']['straat'] = row[3]
    result['adres']['huisnummer'] = row[4]
    result['adres']['postcode'] = row[5]
    result['adres']['plaats'] = row[6]
    result['adres']['provincie'] = row[7]
    result['adres']['gemeente_nr'] = row[8]
    result['adres']['gemeente'] = row[9]

    result['type'] = row[10]
   
    result['contact'] = {}
    result['contact']['telefoon'] = row[11]
    result['contact']['website'] = row[12]
    result['personeel'] = [item for item in personeel if item['bg_nr'] == result['bg_nr'] and item['brin_nr'] == result['brin_nr']]
    
    result['locatie'] = {}
    r = requests.get('http://boskopu.com:9200/koiri/_search?q=url:'+result['adres']['postcode']+'-'+result['adres']['straat']+'-'+result['adres']['huisnummer'])
    result['locatie']['lat'] = 0
    result['locatie']['lon'] = 0
    if r.status_code == 200:
        data = r.json()
        if data['hits'] and data['hits']['total'] > 0:
            source = data['hits']['hits'][0]['_source']
            if source and source['position']:
                result['locatie']['lat'] = source['position']['lat']
                result['locatie']['lon'] = source['position']['lon']
    
    return result

def mapRowPersoneel(row):
    result = {}
    result['onderwijstype'] = row[0];
    result['bg_nr'] = row[1];
    result['brin_nr'] = row[2];
    result['functie'] = row[3];
    result['statistieken'] = [];
    aantalen = row[4:9]
    vaste_aantalen = row[9:14]
    tijdelijk_aantalen = row[14:19]
    vrouw_aantalen = row[19:24]
    man_aantalen = row[24:29]
    onbekend_aantalen = row[29:34]
    leeftijd_15 = row[34:39]
    leeftijd_15_25 = row[39:44]
    leeftijd_25_35 = row[44:49]
    leeftijd_35_45 = row[49:54]
    leeftijd_45_55 = row[54:59]
    leeftijd_55_65 = row[59:64]
    leeftijd_65 = row[64:69]
    leeftijd_onbekend = row[69:74]
    fte_00_05 = row[74:79]
    fte_05_08 = row[79:84]
    fte_08 = row[84:89]
    startjaar = 2011
    for i in range(0, 5):
        item = {}
        item['jaar'] = startjaar + i
        item['aantal'] = aantalen[i]
        item['vaste_dienst'] = vaste_aantalen[i]
        item['tijdelijke_dienst'] = tijdelijk_aantalen[i]
        item['vrouw'] = vrouw_aantalen[i]
        item['man'] = man_aantalen[i]
        item['onbekend'] = onbekend_aantalen[i]
        item['leeftijden'] = {}
        item['leeftijden']['0-15'] = leeftijd_15[i]
        item['leeftijden']['15-25'] = leeftijd_15_25[i]
        item['leeftijden']['25-25'] = leeftijd_25_35[i]
        item['leeftijden']['35-25'] = leeftijd_35_45[i]
        item['leeftijden']['45-25'] = leeftijd_45_55[i]
        item['leeftijden']['55-25'] = leeftijd_55_65[i]
        item['leeftijden']['65+'] = leeftijd_65[i]
        item['leeftijden']['onbekend'] = leeftijd_onbekend[i]
        item['fte'] = {}
        item['fte']['0.0-0.5'] = fte_00_05[i]
        item['fte']['0.5-0.8'] = fte_05_08[i]
        item['fte']['0.8-1.0'] = fte_08[i]
        result['statistieken'].append(item)
    return result

def readCSV(path):
    with open(path,'rU', encoding='latin-1') as file:
        reader = csv.reader(file,delimiter=';');
        i = 0
        for row in reader:
            if i > 0:
                yield row;
            i = i + 1

if __name__ == "__main__":
    main()