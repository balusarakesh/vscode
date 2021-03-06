/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import Platform = require('vs/platform/platform');
import {Extenstions, ITelemetryAppendersRegistry} from 'vs/platform/telemetry/common/telemetry';
import AppInsightsTelemetryAppender = require('vs/workbench/parts/telemetry/node/nodeAppInsightsTelemetryAppender');

Platform.Registry.as<ITelemetryAppendersRegistry>(Extenstions.TelemetryAppenders)
	.registerTelemetryAppenderDescriptor(AppInsightsTelemetryAppender.NodeAppInsightsTelemetryAppender);