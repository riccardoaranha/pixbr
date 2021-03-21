import * as PIX from '../src'
import { expect } from 'chai';



describe('Str Field', function() {
    describe('#indexOf()', function() {
      it('Should return "000201"', function() {
        var field = new PIX.Fields.StrField('00', '01');
        expect(field.getStringValue()).to.equal('000201');
      });
    });
  });

  describe('Num Field', function() {
    describe('#indexOf()', function() {
      it('Should return "010242"', function() {
        var field = new PIX.Fields.NumField('01', 42);
        expect(field.getStringValue()).to.equal('010242');
      });
    });
  });

  describe('Payload_Format_Indicator', function() {
    describe('#indexOf()', function() {
      it('Should return "000201"', function() {
        var field = new PIX.Fields.Payload_Format_Indicator();
        expect(field.getStringValue()).to.equal('000201');
      });
    });
  });

  describe('Grp_Merchant_Account_Information', function() {
    describe('#indexOf()', function() {
      it('Should return "26440014br.gov.bcb.pix0122fulano2019@example.com"', function() {
        var grpfield = new PIX.Groups.Grp_Merchant_Account_Information();
        grpfield.Children.push(new PIX.Fields.Merchant_Account_Information('01', 'fulano2019@example.com'));
        expect(grpfield.getStringValue()).to.equal('26440014br.gov.bcb.pix0122fulano2019@example.com');
      });
    });
  });

  describe('Message Static', function() {
    describe('#indexOf()', function() {
      it('Should return "00020126440014br.gov.bcb.pix0122fulano2019@example.com5204000053039835802BR5913FULANO DE TAL6008BRASILIA6304D58D"', function() {
        var msg = new PIX.Messages.Static('fulano2019@example.com', 'FULANO DE TAL', 'BRASILIA');
        expect(msg.getStringValue()).to.equal('00020126440014br.gov.bcb.pix0122fulano2019@example.com5204000053039835802BR5913FULANO DE TAL6008BRASILIA6304D58D');
      });
    });
  });


/*return new Promise((resolve, reject) => {
    PIX.QRCode.toPNG(test05.toString(), function (data) {
        response.setHeader('Content-Type', 'image/png');
        response.setHeader('Cache-Control', 's-maxage=10, stale-while=revalidate');
        response.write(data);
        response.end();
        resolve(0);
    });
});
	
*/