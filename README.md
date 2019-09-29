# xml2json
Extremely small and in pure JavaScript with zero dependencies XML to JSON converter. 
This is typescript version based on original author [ENKIDOO.AI](https://github.com/enkidoo-ai/xml2json).

## Installation
```
npm install @hendt/xml2json
```

## Usage
### Without XML attributes
```javascript
import xml2json from '@hendt/xml2json';

const xml = '<person><name>John Doe</name></person>';
const json = xml2json(xml); 

console.log(json); 
// prints '{"person": {"name": "John Doe"}}'
```
### With XML attributes
#### Single attribute
```javascript
import xml2json from '@hendt/xml2json';
const xml = '<person id="1234"><name>John Doe</name></person>';
const json = parser.xml2json(xml); 

console.log(json); 
// prints '{"person”: {"id": "1234", "name": "John Doe"}}'
```
#### Multiple attributes
```javascript
import xml2json from '@hendt/xml2json';
const xml = '<person id="1234" age="30"><name>John Doe</name></person>';
const json = parser.xml2json(xml); 

console.log(json); 
// prints '{"person”: {"id”: "1234”, "age”: "30”, "name”: "John Doe”}}'
```
### Special cases
#### Orphan values
```javascript
import xml2json from '@hendt/xml2json';
const xml = '<person id="1234">Something</person>';

// The xml string is converted to : 
// <person><id>1234</id>Something</person>'
//
// This line now contains an orphan value
// the xml string is then converted to :
// '<person><id>1234</id><_@ttribute>Something</_@ttribute></person>'

const json = xml2json(xml); 
console.log(json); 
// prints '{"person": {"id": "1234", "_@ttribute": "Something"}}'
```

Custom name:
```javascript
import xml2json from '@hendt/xml2json';
const xml = '<person id="1234">Something</person>';

const json = xml2json(xml, {aloneValueName: '@value'}); 
console.log(json); 
// prints '{"person": {"id": "1234", "@value": "Something"}}'
```

#### Comments
```javascript
import xml2json from '@hendt/xml2json';

const xml = '<name> <!-- some comment --> Jane Doe </name>';

// The xml string is converted to : 
// <name> Jane Doe </name>
// All comments will be removed 

const json = xml2json(xml); 
console.log(json); 
// prints '{"name": "Jane Doe"}'
```
## License
The MIT License (MIT)

Copyright (c) 2016 Société Enkidoo Technologies Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.