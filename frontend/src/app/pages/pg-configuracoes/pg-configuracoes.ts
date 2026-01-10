import { Component } from '@angular/core';
import { Building2, Database, Download, Eye, Key, LucideAngularModule, Palette, Save, Settings, Shield, Trash2, Upload, User, UserPlus } from 'lucide-angular';
import { ConfigAccessLevels } from '../../components/config-access-levels/config-access-levels';
import { ConfigAccountInfo } from '../../components/config-account-info/config-account-info';
import { ConfigDatabase } from '../../components/config-database/config-database';
import { ConfigInfo } from '../../components/config-info/config-info';
import { ConfigPassword } from '../../components/config-password/config-password';
import { ConfigSecurity } from '../../components/config-security/config-security';
import { ConfigSystem } from '../../components/config-system/config-system';
import { ConfigVisual } from '../../components/config-visual/config-visual';
import { SegmentedControl } from '../../components/segmented-control/segmented-control';
import { ConsultaUsuario } from '../../components/tabelas/consulta-usuario/consulta-usuario';

@Component({
  selector: 'app-pg-configuracoes',
  imports: [
    SegmentedControl,
    LucideAngularModule,
    ConsultaUsuario,
    ConfigInfo,
    ConfigVisual,
    ConfigAccountInfo,
    ConfigAccessLevels,
    ConfigDatabase,
    ConfigPassword,
    ConfigSecurity,
    ConfigSystem,
  ],
  templateUrl: './pg-configuracoes.html',
  styleUrl: './pg-configuracoes.scss'
})
export class PgConfiguracoes {

  readonly Building2 = Building2;
  readonly Save = Save;
  readonly Palette = Palette;
  readonly User = User;
  readonly Key = Key;
  readonly Shield = Shield;
  readonly Settings = Settings;
  readonly Database = Database;
  readonly Eye = Eye;
  readonly Download = Download;
  readonly Upload = Upload;
  readonly Trash2 = Trash2;
  readonly UserPlus = UserPlus;

  selectedPage: number = 0;
  subSelectedPage: number = 0;

  onSelectionChange(index: number) {
    this.selectedPage = index;
  }
  onSubSelectionChange(index: number) {
    this.subSelectedPage = index;
  }
}