import {
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  PlatformAccessory,
  Service,
} from 'homebridge';

import {HmIPPlatform} from '../HmIPPlatform.js';
import {HmIPDevice, HmIPGroup, Updateable} from '../HmIPState.js';
import {HmIPGenericDevice} from './HmIPGenericDevice.js';

interface DimmerChannel {
    index: number;
    functionalChannelType: string;
    dimLevel: number;
    profileMode: string;
    userDesiredProfileMode: string;
}

/**
 * HomematicIP dimmer
 *
 * HmIPW-DRD3 (Homematic IP Wired Dimming Actuator – 3x channels)
 *
 */
export class HmIPDimmerDRD3 extends HmIPGenericDevice implements Updateable {


  private service: (Service | undefined) [] = [undefined,undefined,undefined];

  private brightness: number [] = [ 0, 0, 0];


  constructor(
    platform: HmIPPlatform,
    accessory: PlatformAccessory,
  ) {
    super(platform, accessory);


    this.platform.log.debug(`Created DRD3 dimmer ${accessory.context.device.label}`);

    //remove old Service if service is cached 
    const oldSr = this.accessory.getService(this.platform.Service.Lightbulb);
    if (oldSr !== undefined){
      this.accessory.removeService(oldSr);
      this.platform.log.info(`remove old srv`);
    }

    this.service[0] = <Service>this.accessory.getServiceById(this.platform.Service.Lightbulb, 'Channel0');
    if (!this.service[0]) {
      this.service[0] = new this.platform.Service.Lightbulb(accessory.context.device.label, 'Channel0');
      if (this.service[0]) {
        this.service[0] = this.accessory.addService(this.service[0]);
      } else {
        this.platform.log.error('Error adding service to %s for Channel0', accessory.context.device.label);
      }
    } 
      
    this.service[1] = <Service>this.accessory.getServiceById(this.platform.Service.Lightbulb, 'Channel1');
    if (!this.service[1]) {
      this.service[1] = new this.platform.Service.Lightbulb(accessory.context.device.label, 'Channel1');
      if (this.service[1]) {
        this.service[1] = this.accessory.addService(this.service[1]);
      } else {
        this.platform.log.error('Error adding service to %s for Channel1', accessory.context.device.label);
      }
    } 

    this.service[2] = <Service>this.accessory.getServiceById(this.platform.Service.Lightbulb, 'Channel2');
    if (!this.service[2]) {
      this.service[2] = new this.platform.Service.Lightbulb(accessory.context.device.label, 'Channel2');
      if (this.service[2]) {
        this.service[2] = this.accessory.addService(this.service[2]);
      } else {
        this.platform.log.error('Error adding service to %s for Channel2', accessory.context.device.label);
      }
    } 


    //is this line needed?
    //this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.label);

    this.service[0].getCharacteristic(this.platform.Characteristic.On)
      .on('get', this.handleOnGetCh0.bind(this))
      .on('set', this.handleOnSetCh0.bind(this));

    this.service[0].getCharacteristic(this.platform.Characteristic.Brightness)
      .on('get', this.handleBrightnessGetCh0.bind(this))
      .on('set', this.handleBrightnessSetCh0.bind(this));


    this.service[1].getCharacteristic(this.platform.Characteristic.On)
      .on('get', this.handleOnGetCh1.bind(this))
      .on('set', this.handleOnSetCh1.bind(this));

    this.service[1].getCharacteristic(this.platform.Characteristic.Brightness)
      .on('get', this.handleBrightnessGetCh1.bind(this))
      .on('set', this.handleBrightnessSetCh1.bind(this));


      
    this.service[2].getCharacteristic(this.platform.Characteristic.On)
      .on('get', this.handleOnGetCh2.bind(this))
      .on('set', this.handleOnSetCh2.bind(this));

    this.service[2].getCharacteristic(this.platform.Characteristic.Brightness)
      .on('get', this.handleBrightnessGetCh2.bind(this))
      .on('set', this.handleBrightnessSetCh2.bind(this));


    this.updateDevice(accessory.context.device, platform.groups);



  }

  handleOnGetCh0(callback: CharacteristicGetCallback) {
    callback(null, this.brightness[0] > 0);
  }

  async handleOnSetCh0(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    if (value && this.brightness[0] === 0) {
      await this.handleBrightnessSetCh0(100, callback);
    } else if (!value) {
      await this.handleBrightnessSetCh0(0, callback);
    } else {
      callback(null);
    }
  }

  handleBrightnessGetCh0(callback: CharacteristicGetCallback) {
    callback(null, this.brightness[0]);
  }

  async handleBrightnessSetCh0(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.info('Setting brightness Channel 0  of %s to %s %%', this.accessory.displayName, value);
    const body = {
      channelIndex: 1,
      deviceId: this.accessory.context.device.id,
      dimLevel: <number>value / 100.0,
    };
    await this.platform.connector.apiCall('device/control/setDimLevel', body);
    callback(null);
  }





  handleOnGetCh1(callback: CharacteristicGetCallback) {
    callback(null, this.brightness[1] > 0);
  }

  async handleOnSetCh1(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    if (value && this.brightness[1] === 0) {
      await this.handleBrightnessSetCh1(100, callback);
    } else if (!value) {
      await this.handleBrightnessSetCh1(0, callback);
    } else {
      callback(null);
    }
  }

  handleBrightnessGetCh1(callback: CharacteristicGetCallback) {
    callback(null, this.brightness[1]);
  }

  async handleBrightnessSetCh1(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.info('Setting brightness Channel 1 of %s to %s %%', this.accessory.displayName, value);
    const body = {
      channelIndex: 2,
      deviceId: this.accessory.context.device.id,
      dimLevel: <number>value / 100.0,
    };
    await this.platform.connector.apiCall('device/control/setDimLevel', body);
    callback(null);
  }



  handleOnGetCh2(callback: CharacteristicGetCallback) {
    callback(null, this.brightness[2] > 0);
  }

  async handleOnSetCh2(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    if (value && this.brightness[2] === 0) {
      await this.handleBrightnessSetCh2(100, callback);
    } else if (!value) {
      await this.handleBrightnessSetCh2(0, callback);
    } else {
      callback(null);
    }
  }

  handleBrightnessGetCh2(callback: CharacteristicGetCallback) {
    callback(null, this.brightness[2]);
  }

  async handleBrightnessSetCh2(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.info('Setting brightness Channel 2 of %s to %s %%', this.accessory.displayName, value);
    const body = {
      channelIndex: 3,
      deviceId: this.accessory.context.device.id,
      dimLevel: <number>value / 100.0,
    };
    await this.platform.connector.apiCall('device/control/setDimLevel', body);
    callback(null);
  }


  public updateDevice(hmIPDevice: HmIPDevice, groups: { [key: string]: HmIPGroup }) {
    super.updateDevice(hmIPDevice, groups);

    for (const id in hmIPDevice.functionalChannels) {
      const channel = hmIPDevice.functionalChannels[id];
      if (channel.functionalChannelType === 'DIMMER_CHANNEL') {
        const dimmerChannel = <DimmerChannel>channel;
        this.platform.log.debug(`Dimmer DRD3 update: ${JSON.stringify(channel)}`);

        const chNumber = dimmerChannel.index - 1;

        const brightness = dimmerChannel.dimLevel * 100.0;


        if (brightness !== null && brightness !== this.brightness[chNumber]) {
          if (this.brightness[chNumber] === 0) {
            this.platform.log.info('Dimmer state %s Channel %d changed to ON', this.accessory.displayName,chNumber);
            this.service[chNumber]!.updateCharacteristic(this.platform.Characteristic.On, true);
          }

          if (brightness === 0) {
            this.platform.log.info('Dimmer state %s Channel %d changed to OFF', this.accessory.displayName,chNumber);
            this.service[chNumber]!.updateCharacteristic(this.platform.Characteristic.On, false);
          }

          this.brightness[chNumber] = brightness;
          this.platform.log.debug('Brightness of %s Channel %d changed to %s %%', this.accessory.displayName,chNumber, this.brightness[chNumber].toFixed(0));
          this.service[chNumber]!.updateCharacteristic(this.platform.Characteristic.Brightness, this.brightness[chNumber]);
          
        }
      }
    }
  }

}
