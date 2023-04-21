import 'package:flutter/material.dart';
import 'package:logger/logger.dart';
import 'dart:async';
import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:devcycle_flutter_client_sdk/devcycle_flutter_client_sdk.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final _logger = Logger();
  String _platformVersion = 'Unknown';
  String _displayValue = '';
  String _variableValue = '';
  bool _booleanValue = false;
  num _integerValue = 0;
  num _doubleValue = 0.0;
  var _jsonArrayValue = '';
  var _jsonObjectValue = '';

  var encodedJsonArray = '''
  [
    {"score": 40},
    {"score": 80}
  ]
''';
  var encodedJsonObject = '''
  {
    "score1": 40,
    "score2": 80
  }
''';

  final _dvcClient = DVCClientBuilder()
      .sdkKey('YOUR_DVC_MOBILE_SDK_KEY')
      .user(DVCUserBuilder().userId('123').build())
      .options(DVCOptionsBuilder().logLevel(LogLevel.debug).build())
      .build();

  @override
  void initState() {
    super.initState();
    initPlatformState();
    initVariable();
  }

  // Platform messages are asynchronous, so we initialize in an async method.
  Future<void> initPlatformState() async {
    String platformVersion;
    // Platform messages may fail, so we use a try/catch PlatformException.
    // We also handle the message potentially returning null.
    try {
      platformVersion =
          await _dvcClient.getPlatformVersion() ?? 'Unknown platform version';
    } on PlatformException {
      platformVersion = 'Failed to get platform version.';
    }

    // If the widget was removed from the tree while the asynchronous platform
    // message was in flight, we want to discard the reply rather than calling
    // setState to update our non-existent appearance.
    if (!mounted) return;

    setState(() {
      _platformVersion = platformVersion;
    });
  }

  Future<void> initVariable() async {
    final variable =
        await _dvcClient.variable('string-variable', 'Default Value');
    setState(() {
      _variableValue = variable?.value;
    });
    variable?.onUpdate((updatedValue) {
      setState(() {
        _variableValue = updatedValue;
      });
    });

    final booleanVariable =
        await _dvcClient.variable('boolean-variable', false);
    setState(() {
      _booleanValue = booleanVariable?.value;
    });
    booleanVariable?.onUpdate((updatedValue) {
      setState(() {
        _booleanValue = updatedValue;
      });
    });

    final integerVariable = await _dvcClient.variable('integer-variable', 188);
    setState(() {
      _integerValue = integerVariable?.value;
    });
    integerVariable?.onUpdate((updatedValue) {
      setState(() {
        _integerValue = updatedValue;
      });
    });

    final doubleVariable = await _dvcClient.variable('decimal-variable', 1.88);
    setState(() {
      _doubleValue = doubleVariable?.value;
    });
    doubleVariable?.onUpdate((updatedValue) {
      setState(() {
        _doubleValue = updatedValue;
      });
    });

    final jsonArrayVariable = await _dvcClient.variable(
      'json-array-variable',
      jsonDecode(encodedJsonArray)
    );
    setState(() {
      _jsonArrayValue = jsonEncode(jsonArrayVariable?.value);
    });
    jsonArrayVariable?.onUpdate((updatedValue) {
      setState(() {
        _jsonArrayValue = jsonEncode(updatedValue);
      });
    });
    
    final jsonObjectVariable = await _dvcClient.variable(
      'json-object-variable',
      jsonDecode(encodedJsonObject)
    );
    setState(() {
      _jsonObjectValue = jsonEncode(jsonObjectVariable?.value);
    });
    jsonObjectVariable?.onUpdate((updatedValue) {
      setState(() {
        _jsonObjectValue = jsonEncode(updatedValue);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Plugin example app'),
        ),
        body: Center(
            child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("Value: $_variableValue"),
            Text("Value: $_booleanValue"),
            Text("Value: $_integerValue"),
            Text("Value: $_doubleValue"),
            Text("Value: $_jsonArrayValue"),
            Text("Value: $_jsonObjectValue"),
            Text('Running on: $_platformVersion\n'),
            Icon(
              Icons.star,
              color: _booleanValue ? Colors.blue[500] : Colors.red[500],
            ),
            _booleanValue
                ? const Icon(
                    Icons.sentiment_very_satisfied,
                    color: Colors.grey,
                  )
                : const Icon(
                    Icons.sentiment_very_dissatisfied,
                    color: Colors.grey,
                  ),
            ElevatedButton(
                onPressed: showAllFeatures, child: const Text('All Features')),
            ElevatedButton(
                onPressed: showAllVariables,
                child: const Text('All Variables')),
            ElevatedButton(
                onPressed: identifyUser, child: const Text('Identify User')),
            ElevatedButton(
                onPressed: identifyAnonUser,
                child: const Text('Identify Anonymous User')),
            ElevatedButton(
                onPressed: resetUser, child: const Text('Reset User')),
            ElevatedButton(
                onPressed: trackEvent, child: const Text('Track Event')),
            ElevatedButton(
                onPressed: flushEvents, child: const Text('FlushEvents')),
            Text(_displayValue)
          ],
        )),
      ),
    );
  }
}
