import 'package:flutter/material.dart';
import 'package:hobby_app/core/widgets/gradient_app_bar.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: GradientAppBar(title: 'Profile'),
      body: Center(child: Text('Profile')),
    );
  }
}
