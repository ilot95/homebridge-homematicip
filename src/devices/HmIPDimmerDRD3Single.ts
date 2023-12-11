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
export class HmIPDimmerDRD3Single extends HmIPGenericDevice implements Updateable {


  private service: (Service | undefined) [] = [undefined,undefined,undefined];

  private brightness: number [] = [0, 0, 0];

  private channelIndex: number

  constructor(
    platform: HmIPPlatform,
    accessory: PlatformAccessory,
    chIndex: number,
  ) {
    super(platform, accessory);
    this.channelIndex = chIndex;

    this.platform.log.info(`Created DRD3 dimmer single ${accessory.context.device.label}`);


    //remove old Service if service is cached 
    /*const oldSr = this.accessory.getService(this.platform.Service.Lightbulb);
    if (oldSr !== undefined){
      this.accessory.removeService(oldSr);
      this.platform.log.info(`remove old cached service`);
    }*/

    this.service[0] = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    this.service[0].setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.label + " " + this.channelIndex);

    
      
    


    this.service[0].getCharacteristic(this.platform.Characteristic.On)
      .on('get', this.handleOnGetCh0.bind(this))
      .on('set', this.handleOnSetCh0.bind(this));

    this.service[0].getCharacteristic(this.platform.Characteristic.Brightness)
      .on('get', this.handleBrightnessGetCh0.bind(this))
      .on('set', this.handleBrightnessSetCh0.bind(this));





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
    this.platform.log.info('Setting brightness Channel %d of %s to %s %%',this.channelIndex, this.accessory.displayName, value);
    const body = {
      channelIndex: this.channelIndex + 1,
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
        const chNumber = dimmerChannel.index - 1;
        if(chNumber == this.channelIndex){

          this.platform.log.debug(`Dimmer DRD3 update: ${JSON.stringify(channel)}`);

        
          const brightness = dimmerChannel.dimLevel * 100.0;
  
  
          if (brightness !== null && brightness !== this.brightness[0]) {
            if (this.brightness[0] === 0) {
              this.platform.log.info('Dimmer single state %s Channel %d changed to ON', this.accessory.displayName,chNumber);
              this.service[0]!.updateCharacteristic(this.platform.Characteristic.On, true);
            }
  
            if (brightness === 0) {
              this.platform.log.info('Dimmer single state %s Channel %d changed to OFF', this.accessory.displayName,chNumber);
              this.service[0]!.updateCharacteristic(this.platform.Characteristic.On, false);
            }
  
            this.brightness[0] = brightness;
            this.platform.log.debug('Brightness single of %s Channel %d changed to %s %%', this.accessory.displayName,chNumber, this.brightness[0].toFixed(0));
            this.service[0]!.updateCharacteristic(this.platform.Characteristic.Brightness, this.brightness[0]);
            
          }
        }
        
      }
    }
  }

}
