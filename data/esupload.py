import json
from elasticsearch import Elasticsearch

def main():
   es = Elasticsearch()
   besturen = loadJSON('besturen.json')
   scholen = loadJSON('scholen.json')
   leerlingen = loadJSON('leerlingen')
   for bestuur in besturen:
       huisnummer = ''
       if '-' in bestuur['adres']['huisnummer']:
        huisnummer = bestuur['adres']['huisnummer'].split('-')[0]
       else:
        huisnummer = bestuur['adres']['huisnummer'].split('/')[0]
       bestuur['adres']['huisnummer'] = int(huisnummer)
       es.index(index="adr", doc_type="bestuur", body=json.dumps(bestuur))
   for school in scholen:
       huisnummer = ''
       if '-' in school['adres']['huisnummer']:
        huisnummer = school['adres']['huisnummer'].split('-')[0]
       else:
        huisnummer = school['adres']['huisnummer'].split('/')[0]
       school['adres']['huisnummer'] = int(huisnummer)
       es.index(index="adr", doc_type="school", body=json.dumps(school))

def loadJSON(path):
    data = None
    with open(path,'rU', encoding='latin-1') as file:
        data = json.load(file, encoding='latin-1')
    return data

if __name__ == "__main__":
    main()