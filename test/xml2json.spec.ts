import {expect} from 'chai';
import 'mocha';
import {xml2json} from '../src';

describe('xml2json', () => {
    it('Without XML attributes', () => {
        expect(xml2json('<person><name>John Doe</name></person>'))
            .to.deep.equal({"person": {"name": "John Doe"}});
    });

    describe('With XML attributes', () => {
        it('Single attribute', () => {
            expect(xml2json('<person id="1234"><name>John Doe</name></person>'))
                .to.deep.equal({"person": {"id": "1234", "name": "John Doe"}});
        });

        it('Multiple attributes', () => {
            expect(xml2json('<person id="1234" age="30"><name>John Doe</name></person>'))
                .to.deep.equal({"person": {"id": "1234", "age": "30", "name": "John Doe"}});
        });
    });

    describe('Special cases', () => {
        it('Orphan values', () => {
            expect(xml2json('<person id="1234">Something</person>'))
                .to.deep.equal({"person": {"id": "1234", "_@attribute": "Something"}});
        });

        it('Orphan values custom name', () => {
            expect(xml2json('<person id="1234">Something</person>', {aloneValueName: '@value'}))
                .to.deep.equal({"person": {"id": "1234", "@value": "Something"}});
        });

        it('Comments', () => {
            expect(xml2json('<name> <!-- some comment --> Jane Doe </name>'))
                .to.deep.equal({"name": "Jane Doe"});
        });
    })
});