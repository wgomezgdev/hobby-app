import 'package:flutter/material.dart';
import 'package:hobby_app/core/widgets/gradient_app_bar.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: GradientAppBar(title: 'My Library'),
      body: Center(child: Text('Library')),
    );
  }
}
