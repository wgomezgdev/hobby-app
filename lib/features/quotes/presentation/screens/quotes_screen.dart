import 'package:flutter/material.dart';
import 'package:hobby_app/core/widgets/gradient_app_bar.dart';

class QuotesScreen extends StatelessWidget {
  const QuotesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: GradientAppBar(title: 'Quotes'),
      body: Center(child: Text('Quotes')),
    );
  }
}
